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
    cors: {
      origin: "*",
    },
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
    "WINGO_10MIN": null
  };

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    // Send initial states
    socket.emit("timers_update", games);

    // Force result from admin
    socket.on("force_result", (data) => {
      // data: { gameType, color, number }
      if (data && data.gameType) {
        forcedResults[data.gameType] = data;
        console.log(`Admin forced result for ${data.gameType}:`, data);
      }
    });

    // Receive live bet from client and broadcast to Admin
    socket.on("place_bet", (betData) => {
      // betData: { userId, phone, amount, selection, gameType, period }
      console.log("Live Bet Received:", betData);
      io.emit("admin_live_bet", betData); // Broadcast to admin dashboard
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Global Timer Loop (Runs every second)
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
