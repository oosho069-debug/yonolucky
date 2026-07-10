const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // Game States for Wingo Multi-Timers
  const games = {
    "WINGO_1MIN": { timeRemaining: 60, currentPeriod: new Date().getTime().toString(), duration: 60 },
    "WINGO_3MIN": { timeRemaining: 180, currentPeriod: new Date().getTime().toString(), duration: 180 },
    "WINGO_5MIN": { timeRemaining: 300, currentPeriod: new Date().getTime().toString(), duration: 300 },
    "WINGO_10MIN": { timeRemaining: 600, currentPeriod: new Date().getTime().toString(), duration: 600 }
  };
  
  let forcedResults = {
    "WINGO_1MIN": null,
    "WINGO_3MIN": null,
    "WINGO_5MIN": null,
    "WINGO_10MIN": null,
    "AVIATOR": null // forced crash multiplier
  };

  // Aviator State Machine
  let aviator = {
    status: "BETTING", // BETTING, FLYING, CRASHED
    timeRemaining: 5000, // ms
    multiplier: 1.0,
    crashPoint: 0,
    history: []
  };

  const generateCrashPoint = () => {
    // Standard provably fair algorithm approximation (1% instant crash)
    if (Math.random() < 0.01) return 1.0;
    // The house edge is typically ~3%
    const e = 2 ** 32;
    const h = crypto.getRandomValues(new Uint32Array(1))[0];
    const crash = Math.floor((100 * e - h) / (e - h)) / 100;
    return Math.max(1.0, crash);
  };

  let aviatorLoop;
  const startAviator = () => {
    aviator.status = "BETTING";
    aviator.timeRemaining = 5000;
    aviator.multiplier = 1.0;
    
    // Generate crash point or use forced
    if (forcedResults["AVIATOR"]) {
      aviator.crashPoint = parseFloat(forcedResults["AVIATOR"]);
      forcedResults["AVIATOR"] = null;
    } else {
      // Dummy random for Node without crypto module
      const r = Math.random();
      aviator.crashPoint = r < 0.03 ? 1.0 : parseFloat((1 / (1 - r * 0.95)).toFixed(2));
    }
    
    io.emit("aviator_update", aviator);

    // Betting Phase
    let betInterval = setInterval(() => {
      aviator.timeRemaining -= 1000;
      io.emit("aviator_update", aviator);
      if (aviator.timeRemaining <= 0) {
        clearInterval(betInterval);
        startFlying();
      }
    }, 1000);
  };

  const startFlying = () => {
    aviator.status = "FLYING";
    let tick = 0;
    let flyInterval = setInterval(() => {
      tick += 50; // 50ms tick
      // Multiplier increases exponentially over time
      aviator.multiplier = parseFloat((Math.pow(1.04, tick / 1000)).toFixed(2));
      
      if (aviator.multiplier >= aviator.crashPoint) {
        clearInterval(flyInterval);
        aviator.multiplier = aviator.crashPoint;
        crashAviator();
      } else {
        io.emit("aviator_update", aviator);
      }
    }, 50);
  };

  const crashAviator = () => {
    aviator.status = "CRASHED";
    aviator.history.unshift(aviator.crashPoint);
    if (aviator.history.length > 20) aviator.history.pop();
    
    io.emit("aviator_update", aviator);
    
    // Wait 3 seconds then restart
    setTimeout(() => {
      startAviator();
    }, 3000);
  };

  // Start Aviator Engine
  startAviator();

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    // Send initial states
    socket.emit("timers_update", games);
    socket.emit("aviator_update", aviator);

    // Force result from admin
    socket.on("force_result", (data) => {
      if (data && data.gameType) {
        if (data.gameType === "AVIATOR") {
          forcedResults["AVIATOR"] = data.multiplier;
        } else {
          forcedResults[data.gameType] = data;
        }
        console.log(`Admin forced result for ${data.gameType}:`, data);
      }
    });

    // Receive live bet from client and broadcast to Admin
    socket.on("place_bet", (betData) => {
      console.log("Live Bet Received:", betData);
      io.emit("admin_live_bet", betData);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Global Timer Loop (Runs every second) for Wingo
  setInterval(() => {
    let updateNeeded = false;
    let resultsEmitted = [];

    for (const [gameType, state] of Object.entries(games)) {
      state.timeRemaining--;
      updateNeeded = true;

      if (state.timeRemaining <= 0) {
        state.timeRemaining = state.duration; // Reset timer
        
        let resultNumber, resultColor;
        const forcedResult = forcedResults[gameType];

        if (forcedResult) {
          resultColor = forcedResult.color;
          if (resultColor === "GREEN") resultNumber = 1; 
          else if (resultColor === "RED") resultNumber = 2; 
          else resultNumber = 0; 
          
          if (forcedResult.number !== undefined) {
            resultNumber = forcedResult.number;
          }
          forcedResults[gameType] = null; // Clear force
        } else {
          // Random generation
          resultNumber = Math.floor(Math.random() * 10);
          resultColor = "GREEN";
          if (resultNumber % 2 === 0) resultColor = "RED";
          if (resultNumber === 0 || resultNumber === 5) resultColor = "VIOLET";
        }

        resultsEmitted.push({ gameType, period: state.currentPeriod, resultNumber, resultColor });
        
        // Advance period
        state.currentPeriod = (BigInt(state.currentPeriod) + 1n).toString();
      }
    }

    if (resultsEmitted.length > 0) {
      io.emit("game_results", resultsEmitted);
    }
    
    if (updateNeeded) {
      io.emit("timers_update", games);
    }
  }, 1000);

  server.once("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
