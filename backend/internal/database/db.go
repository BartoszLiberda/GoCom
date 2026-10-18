package database

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

func ConnectDB() error {
	ctx := context.Background()
	dbURL := os.Getenv("DATABASE_URL")

	if dbURL == "" {
		return fmt.Errorf("DATABASE_URL environment variable not set")
	}

	var err error
	DB, err = pgxpool.New(ctx, dbURL)
	if err != nil {
		return fmt.Errorf("could not connect to database: %v", err)
	}

	if err := DB.Ping(ctx); err != nil {
		return fmt.Errorf("could not ping database: %v", err)
	}

	fmt.Println("Connected to database")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		fmt.Println("Closed database connection")
	}
}
