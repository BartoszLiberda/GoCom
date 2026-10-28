package database

import (
	"context"
	_ "embed"
	"fmt"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

//go:embed schema.sql
var schemaSQL string

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

	if err := applySchema(ctx); err != nil {
		return fmt.Errorf("failed to apply schema: %v", err)
	}

	fmt.Println("Connected to database")
	return nil
}

func applySchema(ctx context.Context) error {
	if strings.TrimSpace(schemaSQL) == "" {
		return fmt.Errorf("schema.sql is empty or //go:embed failed to load it")
	}

	fmt.Printf("Loaded schema.sql (Length: %d bytes). Executing...\n", len(schemaSQL))

	_, err := DB.Exec(ctx, schemaSQL)
	if err != nil {
		return fmt.Errorf("database rejected the schema: %v", err)
	}

	fmt.Println("Schema applied successfully")
	return nil
}

func CloseDB() {
	if DB != nil {
		DB.Close()
		fmt.Println("Closed database connection")
	}
}
