package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/bartoszliberda/gocom-backend/internal/database"
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

	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "ok"}`))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Listening on port %s\n", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Server crashed: %v", err)
	}
}
