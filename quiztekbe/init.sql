CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    category TEXT,
    creator_email TEXT, -- either i default "" or i write coalesce over and over in handlers
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
    quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position INT NOT NULL, -- ordering of questions
    type VARCHAR(10) NOT NULL, -- 'tf' (true/false), 'mc' (multiple choice ),'fib' (fill in the blank)
    message TEXT NOT NULL,
    choices TEXT[] DEFAULT NULL, -- for multiple choice & maybe true false
    answer_tf BOOLEAN,
    correct_choice INT, -- For multiple choice: maybe store an index (or you could store the answer text)
    correct_answers TEXT[] DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS submission_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS submission_answers (
    attempt_id UUID REFERENCES submission_attempts(attempt_id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(question_id) ON DELETE CASCADE,
    answer_tf BOOLEAN,
    correct_choice INT,
    correct_answers TEXT[] DEFAULT NULL,
    CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
);

