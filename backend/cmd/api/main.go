package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/bartoszliberda/gocom-backend/internal/database"
	"github.com/bartoszliberda/gocom-backend/internal/handlers"
	"github.com/bartoszliberda/gocom-backend/internal/middleware"
	"github.com/bartoszliberda/gocom-backend/internal/ws"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}

	if err := database.ConnectDB(); err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	defer database.CloseDB()

	hub := ws.NewHub()
	go hub.Run()

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok"}`))
	})

	mux.HandleFunc("GET /api/setup/status", handlers.CheckSetupStatus)
	mux.HandleFunc("POST /api/setup", handlers.PerformSetup)
	mux.HandleFunc("POST /api/login", handlers.Login)
	mux.Handle("/api/users/@me", middleware.AuthMiddleware(http.HandlerFunc(handlers.GerMe)))
	mux.Handle("/api/server", middleware.AuthMiddleware(http.HandlerFunc(handlers.GetServerSettings)))
	mux.Handle("/api/channels", middleware.AuthMiddleware(http.HandlerFunc(handlers.GetChannels)))
	mux.Handle("GET /api/channels/{channelID}/messages", middleware.AuthMiddleware(http.HandlerFunc(handlers.GetChannelMessages)))
	mux.Handle("GET /api/channels/{channelID}", middleware.AuthMiddleware(http.HandlerFunc(handlers.GetChannel)))
	mux.Handle("POST /api/invites", middleware.AuthMiddleware(http.HandlerFunc(handlers.CreateInvite)))
	mux.Handle("GET /api/invites/{code}", http.HandlerFunc(handlers.ValidateInvite))
	mux.Handle("POST /api/register", http.HandlerFunc(handlers.RegisterUser))

	mux.Handle("POST /api/channels/{channelID}/messages", middleware.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handlers.SendMessage(w, r, hub)
	})))
	mux.Handle("GET /api/ws", middleware.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ws.ServeWS(hub, w, r)
	})))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	handler := middleware.EnableCORS(mux)

	fmt.Printf("Listening on port %s\n", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatalf("Server crashed: %v", err)
	}
}
