const caja = document.getElementById('options');
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const typeSelect = document.getElementById('type');
const startBtn = document.getElementById('startBtn');
const quizContainer = document.getElementById('quiz-container');
const scoreContainer = document.getElementById('score');
const newTriviaBtn = document.getElementById('newTriviaBtn');

let currentQuestion = 0;
let score = 0;
let triviaData = [];
let userAnswers = []; // Array para guardar las respuestas del usuario
let timer; // Variable para el temporizador

// Obtener las categorías de la API
fetch('https://opentdb.com/api_category.php')
    .then(response => response.json())
    .then(data => {
        data.trivia_categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.text = category.name;
            categorySelect.add(option);
        });
    });

// Manejar el clic en el botón "Crear Trivia"
startBtn.addEventListener('click', () => {
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;
    const type = typeSelect.value;
   

    // Construir la URL de la API
    let apiUrl = `https://opentdb.com/api.php?amount=10`;
    if (category !== '') {
        apiUrl += `&category=${category}`;
    }
    if (difficulty !== '') {
        apiUrl += `&difficulty=${difficulty}`;
    }
    if (type !== '') {
        apiUrl += `&type=${type}`;
    }

    // Obtener las preguntas de la API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            triviaData = data.results;
            userAnswers = []; // Reiniciar el array de respuestas del usuario
            showQuestion();
        });
});

// Mostrar la pregunta actual
function showQuestion() {
    if (currentQuestion < triviaData.length) {
        const questionData = triviaData[currentQuestion];

        // Decodificar entidades HTML en las preguntas y respuestas
        const questionText = decodeURIComponent(questionData.question);
        const correctAnswer = decodeURIComponent(questionData.correct_answer);
        const incorrectAnswers = questionData.incorrect_answers.map(answer => decodeURIComponent(answer));
        caja.classList.add("despues");
        

        // Crear el HTML para la pregunta y las respuestas
        let questionHTML = `
            <div class="question">
                <h3>${questionText}</h3>
                <div id="timer">Tiempo restante: 20</div>
                <ul>
        `;
        const answers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5); // Ordenar aleatoriamente las respuestas
        answers.forEach(answer => {
            questionHTML += `
                    <li class="answer">
                        <input type="radio" name="answer" value="${answer}"> ${answer}
                    </li>
            `;
        });
        questionHTML += `
                </ul>
                <button onclick="checkAnswer('${correctAnswer}')">Responder</button>
            </div>
        `;
        quizContainer.style.display = 'block'; // Mostrar el botón de nueva trivia

        quizContainer.innerHTML = questionHTML;

        // Iniciar el temporizador
        let timeLeft = 20; // Tiempo en segundos
        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timer').textContent = `Tiempo restante: ${timeLeft}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                checkAnswer(''); // Pasar una respuesta vacía para marcarla como incorrecta
            }
        }, 1000);
    } else {
        // Mostrar el puntaje final y las respuestas
        clearInterval(timer);
        showResults();
    }
}



// Verificar la respuesta del usuario
function checkAnswer(correctAnswer) {
    clearInterval(timer);
    quizContainer.style.display = 'block'; // Mostrar el botón de nueva trivia
    
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        userAnswers.push(selectedAnswer.value); // Guardar la respuesta del usuario
        if (selectedAnswer.value === correctAnswer) {
            score += 100;
        }
        currentQuestion++;
        showQuestion();
    } else {
        // Si el tiempo se agotó, se pasa a la siguiente pregunta
        if (correctAnswer === '') {
            userAnswers.push(''); // Guardar una respuesta vacía para indicar que no se respondió
            currentQuestion++;
            showQuestion();
        } else {
            alert('Por favor, selecciona una respuesta.');
        }
    }
}

// Mostrar el puntaje final y las respuestas
function showResults() {
    let resultsHTML = `<h2>Puntaje final: ${score} de ${triviaData.length * 100}</h2>`;
    resultsHTML += '<ul>';
    for (let i = 0; i < triviaData.length; i++) {
        const questionData = triviaData[i];
        const questionText = decodeURIComponent(questionData.question);
        const correctAnswer = decodeURIComponent(questionData.correct_answer);
        const userAnswer = userAnswers[i];

        resultsHTML += `<li>${questionText}<br>`;
        resultsHTML += `<span class="turespuesta">Tu respuesta: ${userAnswer}</span><br>`;
        resultsHTML += `<span class="correct">Respuesta correcta: ${correctAnswer}</span><br>`;

        // Resaltar la respuesta incorrecta en rojo
        if (userAnswer !== correctAnswer) {
            resultsHTML += `<span class="incorrect">Respuesta incorrecta</span>`;
        }

        resultsHTML += '</li>';
    }
    resultsHTML += '</ul>';

    quizContainer.innerHTML = resultsHTML;
    scoreContainer.textContent = '';
    newTriviaBtn.style.display = 'block'; // Mostrar el botón de nueva trivia
}

// Manejar el clic en el botón "Nueva Trivia"
newTriviaBtn.addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    userAnswers = []; // Reiniciar el array de respuestas del usuario
    scoreContainer.textContent = '';
    quizContainer.innerHTML = '';
    newTriviaBtn.style.display = 'none'; // Ocultar el botón de nueva trivia
});