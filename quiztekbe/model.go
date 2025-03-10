package main

import (
	"github.com/google/uuid"
	"time"
)

type User struct {
	Email string `json:"email"`
}

type Quiz struct {
	Quiz_id       uuid.UUID `json:"id"`
	Title         string    `json:"title"`
	Category      string    `json:"category"`
	Creator_email string    `json:"creator_email"`
	Created_at    time.Time `json:"created_at"`
}

type Quiz_Detail struct {
	Quiz_id       uuid.UUID `json:"id"`
	Title         string    `json:"title"`
	Category      string    `json:"category"`
	Creator_email string    `json:"creator_email"`
	Created_at    time.Time `json:"created_at"`
}

type Quiz_Post struct {
	Title    string `json:"title"`
	Category string `json:"category"`
	// Creator_email string `json:"creator_email"`
	// need to wait til auth is implemented, rn it defaults to '' email
	// error and temp solution documented in console
}

type Quiz_Update struct {
	Title    string `json:"title"`
	Category string `json:"category"`
}

type Question struct {
	Quiz_id         uuid.UUID `json:"quiz_id"`
	Question_id     uuid.UUID `json:"question_id"`
	Position        int       `json:"position"`
	Type            string    `json:"type"` // 'tf', 'mc', 'fib'
	Message         string    `json:"message"`
	Choices         []string  `json:"choices"`
	Answer_tf       *bool     `json:"answer_tf"`
	Correct_choice  *int      `json:"correct_choice"`
	Correct_answers []string  `json:"correct_answers"`
}

type Question_Update struct {
	Type            string   `json:"type"`
	Message         string   `json:"message"`
	Choices         []string `json:"choices"`
	Answer_tf       *bool    `json:"answer_tf"`
	Correct_choice  *int     `json:"correct_choice"`
	Correct_answers []string `json:"correct_answers"`
}

type Submission_answer struct {
	Attempt_id      uuid.UUID `json:"attempt_id"`
	Question_id     uuid.UUID `json:"question_id"`
	Answer_tf       *bool     `json:"answer_tf"`
	Correct_choice  *int      `json:"correct_choice"`
	Correct_answers []string  `json:"correct_answers"`
}
