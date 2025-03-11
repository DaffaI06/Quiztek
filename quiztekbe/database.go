package main

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"log"
	"os"
)

var db *pgxpool.Pool

func connectToDb() error {
	//if err := godotenv.Load(); err != nil {
	//	log.Fatal("Error loading .env file")
	//}
	// docker compose handles it

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	var err error
	db, err = pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatal(err)
	}
	return nil
}
