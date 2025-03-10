package main

import (
	"context"
	"database/sql"
	"github.com/google/uuid"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
)

// GetQuizzes godoc
// @Summary      Get all quizzes
// @Description  Get all quizzes from the database, optionally filtering by title, category, or date.
// @Tags         quiz
// @Accept       json
// @Produce      json
// @Param        title     query    string  false  "Quiz title to search for"
// @Param        category  query    string  false  "Quiz category to search for"
// @Param        date      query    string  false  "Quiz creation date to search for"
// @Success      200  {array}   Quiz
// @Failure      500  {object}  map[string]interface{}
// @Router       /quiz [get]
func GetQuizzes(c *fiber.Ctx) error {
	queryStr := "SELECT quiz_id, title, category, COALESCE(creator_email, ''), created_at FROM quizzes"
	var params []interface{}

	// %something% and ILIKE is sql wildcard
	if title := c.Query("title"); title != "" {
		queryStr += " WHERE title ILIKE $1"
		params = append(params, "%"+title+"%")
	} else if category := c.Query("category"); category != "" {
		queryStr += " WHERE category ILIKE $1"
		params = append(params, "%"+category+"%")
	} else if date := c.Query("date"); date != "" {
		queryStr += " WHERE to_char(created_at, 'DD FMMonth YYYY') ILIKE $1"
		params = append(params, "%"+date+"%")
	}

	rows, err := db.Query(context.Background(), queryStr, params...)
	if err != nil {
		log.Println(err)
		return c.SendStatus(500)
	}
	defer rows.Close() // Query/rows need closing cuz its a "cursor" but QueryRow/row doesnt

	var quizzes []Quiz
	for rows.Next() {
		var quiz Quiz
		if err := rows.Scan(&quiz.Quiz_id, &quiz.Title, &quiz.Category, &quiz.Creator_email, &quiz.Created_at); err != nil {
			log.Println(err)
			return c.SendStatus(500)
		}
		quizzes = append(quizzes, quiz)
	}
	return c.JSON(quizzes)
}

// GetQuiz godoc
// @Summary      Get a single quiz
// @Description  Retrieve the details of a quiz by its ID.
// @Tags         quiz
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Quiz ID"
// @Success      200  {object}  Quiz_Detail
// @Failure      500  {object}  map[string]interface{}
// @Router       /quiz/{id} [get]
func GetQuiz(c *fiber.Ctx) error {

	quizIDStr := c.Params("id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quiz id"})
	}

	queryStr := "SELECT quiz_id, title, category, COALESCE(creator_email, ''), created_at FROM quizzes WHERE quiz_id = $1"

	row := db.QueryRow(context.Background(), queryStr, quizID)

	var quiz_Detail Quiz_Detail
	if err := row.Scan(&quiz_Detail.Quiz_id, &quiz_Detail.Title, &quiz_Detail.Category, &quiz_Detail.Creator_email, &quiz_Detail.Created_at); err != nil {
		log.Fatal(err)
	}

	return c.JSON(quiz_Detail)
}

// PostQuiz godoc
// @Summary      Create a new quiz
// @Description  Create a new quiz with the provided title and category.
// @Tags         quiz
// @Accept       json
// @Produce      json
// @Param        quiz  body      Quiz_Post  true  "Quiz to create"
// @Success      201   {object}  map[string]string  "Quiz added message"
// @Failure      400   {object}  map[string]string  "Bad request"
// @Failure      500   {object}  map[string]string  "Internal server error"
// @Router       /quiz [post]
func PostQuiz(c *fiber.Ctx) error {
	var quizPost Quiz_Post
	if err := c.BodyParser(&quizPost); err != nil {
		return c.SendStatus(400)
	}

	queryStr := "INSERT INTO quizzes (title, category) VALUES ($1, $2)"
	_, err := db.Exec(context.Background(), queryStr, quizPost.Title, quizPost.Category)
	if err != nil {
		log.Println("DB Exec error:", err)
		return c.SendStatus(500)
	}

	return c.Status(201).JSON(fiber.Map{"message": "Quiz added"})
}

// PatchQuiz godoc
// @Summary      Update a quiz
// @Description  Update the title and category of an existing quiz.
// @Tags         quiz
// @Accept       json
// @Produce      json
// @Param        id    path      string       true  "Quiz ID"
// @Param        quiz  body      Quiz_Update  true  "Quiz update data"
// @Success      200   {object}  Quiz_Update
// @Failure      400   {object}  map[string]string  "Bad request or invalid quiz ID"
// @Failure      500   {object}  map[string]string  "Internal server error"
// @Router       /quiz/{id} [patch]
func PatchQuiz(c *fiber.Ctx) error {
	quizIDStr := c.Params("id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quiz ID"})
	}

	var quizUpdate Quiz_Update
	if err := c.BodyParser(&quizUpdate); err != nil {
		return c.SendStatus(400)
	}

	queryStr := "UPDATE quizzes SET title = $2, category = $3 WHERE quiz_id = $1 RETURNING title, category"
	row := db.QueryRow(context.Background(), queryStr, quizID, quizUpdate.Title, quizUpdate.Category)

	if err := row.Scan(&quizUpdate.Title, &quizUpdate.Category); err != nil {
		return c.SendStatus(500)
	}
	return c.JSON(quizUpdate)
}

// DeleteQuiz godoc
// @Summary      Delete a quiz
// @Description  Delete an existing quiz by its ID.
// @Tags         quiz
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Quiz ID"
// @Success      200  {object}  map[string]string  "Quiz deleted message"
// @Failure      400  {object}  map[string]string  "Bad request or invalid quiz ID"
// @Failure      500  {object}  map[string]string  "Internal server error"
// @Router       /quiz/{id} [delete]
func DeleteQuiz(c *fiber.Ctx) error {
	quizIDStr := c.Params("id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quiz ID"})
	}

	queryStr := "DELETE FROM quizzes WHERE quiz_id = $1"
	_, err = db.Exec(context.Background(), queryStr, quizID)
	if err != nil {
		return c.SendStatus(500)
	}

	return c.Status(200).JSON(fiber.Map{"message": "Quiz deleted", "id": quizID})
}

// GetQuestionsByQuizId godoc
// @Summary      Get question IDs for a quiz
// @Description  Retrieve an ordered list of question IDs for a specific quiz.
// @Tags         quiz, question
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Quiz ID"
// @Success      200  {array}   string
// @Failure      400  {object}  map[string]string  "Invalid quiz id"
// @Failure      500  {object}  map[string]string  "Error fetching questions"
// @Router       /quiz/question/{id} [get]
func GetQuestionsByQuizId(c *fiber.Ctx) error {
	quizIDStr := c.Params("id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quiz id"})
	}

	queryStr := "SELECT question_id FROM questions WHERE quiz_id = $1 ORDER BY position"
	rows, err := db.Query(context.Background(), queryStr, quizID)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Error fetching questions"})
	}
	defer rows.Close()

	var questionIDs []string
	for rows.Next() {
		var qid uuid.UUID
		if err := rows.Scan(&qid); err != nil {
			log.Println(err)
			return c.Status(500).JSON(fiber.Map{"error": "Error scanning question id"})
		}
		questionIDs = append(questionIDs, qid.String()) // eror klo ga .String()
	}

	return c.JSON(questionIDs)
}

// GetQuestion godoc
// @Summary      Get a single question
// @Description  Retrieve the details of a question by its ID.
// @Tags         question
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Question ID"
// @Success      200  {object}  Question
// @Failure      400  {object}  map[string]string  "Invalid question ID"
// @Failure      404  {object}  map[string]string  "Question not found"
// @Router       /question/{id} [get]
func GetQuestion(c *fiber.Ctx) error {
	questionIDStr := c.Params("id")
	questionID, err := uuid.Parse(questionIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid question ID"})
	}

	// Build the SQL query.
	queryStr := `
		SELECT quiz_id, question_id, position, type, message, choices, answer_tf, correct_choice, correct_answers 
		FROM questions 
		WHERE question_id = $1
	`

	// Query the database.
	row := db.QueryRow(context.Background(), queryStr, questionID)
	var question Question
	err = row.Scan(&question.Quiz_id, &question.Question_id, &question.Position, &question.Type,
		&question.Message, &question.Choices, &question.Answer_tf, &question.Correct_choice, &question.Correct_answers)
	if err != nil {
		log.Println(err)
		return c.SendStatus(404)
	}
	return c.JSON(question)
}

// PostQuestionByQuizId godoc
// @Summary      Add a new question to a quiz
// @Description  Add a new question at the end of the question list for a specified quiz. The position is set as the current count of questions for the quiz plus one.
// @Tags         quiz, question
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Quiz ID"
// @Success      201  {object}  map[string]interface{}  "New question details including question_id and position"
// @Failure      400  {object}  map[string]string       "Invalid quiz ID"
// @Failure      500  {object}  map[string]string       "Error getting question count or inserting new question"
// @Router       /quiz/{id}/question [post]
func PostQuestionByQuizId(c *fiber.Ctx) error {
	// Parse and validate the quiz ID from the URL.
	quizIDStr := c.Params("id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quiz id"})
	}

	var count int
	countQuery := "SELECT COUNT(*) FROM questions WHERE quiz_id = $1"
	err = db.QueryRow(context.Background(), countQuery, quizID).Scan(&count)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get question count"})
	}
	newPos := count + 1

	//default vals
	defaultType := "tf"
	defaultMessage := ""

	insertQuery := `
		INSERT INTO questions (quiz_id, position, type, message)
		VALUES ($1, $2, $3, $4)
		RETURNING question_id
	`
	var newQuestionID uuid.UUID
	err = db.QueryRow(context.Background(), insertQuery, quizID, newPos, defaultType, defaultMessage).Scan(&newQuestionID)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert new question"})
	}

	return c.Status(201).JSON(fiber.Map{
		"question_id": newQuestionID.String(),
		"position":    newPos,
	})
}

// PatchQuestion godoc
// @Summary      Update a question
// @Description  Update specific fields of an existing question by its ID. The quiz_id remains unchanged.
// @Tags         question
// @Accept       json
// @Produce      json
// @Param        id    path      string           true  "Question ID"
// @Param        body  body      Question_Update  true  "Fields to update for the question"
// @Success      200  {object}  map[string]string  "Success status message"
// @Failure      400  {object}  map[string]string  "Invalid question ID or JSON payload"
// @Failure      500  {object}  map[string]string  "Failed to update question"
// @Router       /question/{id} [patch]
func PatchQuestion(c *fiber.Ctx) error {
	questionIDStr := c.Params("id")
	questionID, err := uuid.Parse(questionIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid question ID"})
	}

	var questionUpdate Question_Update
	if err := c.BodyParser(&questionUpdate); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	queryStr := `
		UPDATE questions
		SET quiz_id = quiz_id,
		    type = $1,
		    message = $2,
		    choices = $3,
		    answer_tf = $4,
		    correct_choice = $5,
		    correct_answers = $6
		WHERE question_id = $7
	`
	_, err = db.Exec(context.Background(), queryStr,
		questionUpdate.Type,
		questionUpdate.Message,
		questionUpdate.Choices,
		questionUpdate.Answer_tf,
		questionUpdate.Correct_choice,
		questionUpdate.Correct_answers,
		questionID,
	)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update question"})
	}
	return c.JSON(fiber.Map{"status": "success"})
}

// DeleteQuestion godoc
// @Summary      Delete a question
// @Description  Delete a question by its ID, then update the positions of subsequent questions in the same quiz.
// @Tags         question
// @Accept       json
// @Produce      json
// @Param        id   path      string  true  "Question ID"
// @Success      200  {object}  map[string]string  "Status message indicating deletion"
// @Failure      400  {object}  map[string]string  "Invalid question ID"
// @Failure      404  {object}  map[string]string  "Question not found"
// @Failure      500  {object}  map[string]string  "Error during deletion or position update"
// @Router       /question/{id} [delete]
func DeleteQuestion(c *fiber.Ctx) error {
	questionIDStr := c.Params("id")
	questionID, err := uuid.Parse(questionIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid question ID"})
	}

	tx, err := db.Begin(context.Background())
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to start transaction"})
	}
	defer tx.Rollback(context.Background())

	var quizID uuid.UUID
	var pos int
	selectQuery := `SELECT quiz_id, position FROM questions WHERE question_id = $1`
	err = tx.QueryRow(context.Background(), selectQuery, questionID).Scan(&quizID, &pos)
	if err != nil {
		log.Println(err)
		return c.Status(404).JSON(fiber.Map{"error": "Question not found"})
	}

	deleteQuery := `DELETE FROM questions WHERE question_id = $1`
	_, err = tx.Exec(context.Background(), deleteQuery, questionID)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete question"})
	}

	updateQuery := `
		UPDATE questions 
		SET position = position - 1 
		WHERE quiz_id = $1 AND position > $2
	`
	_, err = tx.Exec(context.Background(), updateQuery, quizID, pos)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update positions"})
	}

	if err = tx.Commit(context.Background()); err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to commit transaction"})
	}

	return c.JSON(fiber.Map{"status": "deleted"})
}

func PostAttemptByQuizId(c *fiber.Ctx) error {
	quizIDStr := c.Params("id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quiz ID"})
	}

	queryStr := `INSERT INTO Submission_attempts (quiz_id) VALUES ($1) RETURNING attempt_id`
	var attemptID uuid.UUID
	err = db.QueryRow(context.Background(), queryStr, quizID).Scan(&attemptID)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to insert new attempt"})
	}
	return c.Status(200).JSON(fiber.Map{"attempt_id": attemptID})
}

func PutAnswerByAttemptId(c *fiber.Ctx) error {
	attemptIDStr := c.Params("id")
	attemptID, err := uuid.Parse(attemptIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid attempt ID"})
	}

	var submission Submission_answer
	if err := c.BodyParser(&submission); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Cannot parse JSON"})
	}

	queryStr := `
      INSERT INTO submission_answers (attempt_id, question_id, answer_tf, correct_choice, correct_answers)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (attempt_id, question_id) DO UPDATE
      SET answer_tf = EXCLUDED.answer_tf,
          correct_choice = EXCLUDED.correct_choice,
          correct_answers = EXCLUDED.correct_answers;
    `
	_, err = db.Exec(context.Background(), queryStr,
		attemptID,
		submission.Question_id,
		submission.Answer_tf,
		submission.Correct_choice,
		submission.Correct_answers,
	)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update answer"})
	}
	return c.Status(200).JSON(fiber.Map{"status": "success"})
}

func GetAnswer(c *fiber.Ctx) error {
	attemptIDStr := c.Params("attemptid")
	questionID := c.Params("questionid")
	attemptID, err := uuid.Parse(attemptIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid attempt ID"})
	}

	var submission Submission_answer
	queryStr := `
        SELECT answer_tf, correct_choice, correct_answers
        FROM submission_answers
        WHERE attempt_id = $1 AND question_id = $2
    `
	err = db.QueryRow(context.Background(), queryStr, attemptID, questionID).
		Scan(&submission.Answer_tf, &submission.Correct_choice, &submission.Correct_answers)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.Status(200).JSON(fiber.Map{})
		}
		return c.Status(500).JSON(fiber.Map{"error": "Failed to get answer"})
	}
	return c.JSON(submission)
}

func CompleteAttempt(c *fiber.Ctx) error {
	attemptIDStr := c.Params("attemptid")
	attemptID, err := uuid.Parse(attemptIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid attempt ID"})
	}
	queryStr := `UPDATE submission_attempts SET completed_at = NOW() WHERE attempt_id = $1`
	_, err = db.Exec(context.Background(), queryStr, attemptID)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to complete attempt"})
	}
	return c.JSON(fiber.Map{"status": "completed"})
}

func GetLatestSubmissions(c *fiber.Ctx) error {
	quizIDStr := c.Params("id")
	quizID, err := uuid.Parse(quizIDStr)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid quiz ID"})
	}
	queryStr := `
      SELECT sa.attempt_id, sa.completed_at,
             (SELECT COUNT(*) FROM questions q WHERE q.quiz_id = $1) as total,
             (
                SELECT COUNT(*) 
                FROM submission_answers sub
                JOIN questions q ON sub.question_id = q.question_id
                WHERE sub.attempt_id = sa.attempt_id
                  AND (
                      (q.type = 'tf' AND sub.answer_tf = q.answer_tf)
                      OR (q.type = 'mc' AND sub.correct_choice = q.correct_choice)
                      OR (q.type = 'fib' AND sub.correct_answers = q.correct_answers)
                  )
             ) as score
      FROM submission_attempts sa
      WHERE sa.quiz_id = $1
        AND sa.completed_at IS NOT NULL
      ORDER BY sa.completed_at DESC
      LIMIT 5;
    `
	rows, err := db.Query(context.Background(), queryStr, quizID)
	if err != nil {
		log.Println(err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch latest submissions"})
	}
	defer rows.Close()

	type SubmissionResult struct {
		AttemptID   uuid.UUID `json:"attempt_id"`
		CompletedAt string    `json:"completed_at"`
		Total       int       `json:"total"`
		Score       int       `json:"score"`
	}
	var results []SubmissionResult
	for rows.Next() {
		var res SubmissionResult
		var completedAt time.Time
		if err := rows.Scan(&res.AttemptID, &completedAt, &res.Total, &res.Score); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to scan submission result"})
		}
		//format as "HH:MM DD Month YYYY"
		res.CompletedAt = completedAt.Format("15:04 02 January 2006")
		results = append(results, res)
	}
	return c.JSON(results)
}
