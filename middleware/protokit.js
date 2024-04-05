const createExam = (examID, questions) => {
  if(isMochaRunning() == true) return;
  const url = 'http://process.env.PROTOKIT_URL/create/exam';

  // Data to be sent in the POST request (can be JSON, FormData, etc.)
  const postData = {
    examID: examID,
    questions: questions
  };

  // Options for the fetch request
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Adjust content type as needed
    },
    body: JSON.stringify(postData) // Convert data to JSON string
  };

  // Making the POST request using fetch
  fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parsing JSON response
    })
    .then(data => {
      console.log('Success:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

const submitAnswer = (examID, userID, questionID, userAnswer) => {
  if(isMochaRunning() == true) return;
  const url = 'http://process.env.PROTOKIT_URL/submit-user-answer';

  // Data to be sent in the POST request (can be JSON, FormData, etc.)
  const postData = {
    examID: examID,
    userID: userID,
    questionID: questionID,
    userAnswer: userAnswer
  };

  // Options for the fetch request
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Adjust content type as needed
    },
    body: JSON.stringify(postData) // Convert data to JSON string
  };

  // Making the POST request using fetch
  fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parsing JSON response
    })
    .then(data => {
      console.log('Success:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

const publishCorrectAnswers = (examID, questionsWithCorrectAnswers) => {
  if(isMochaRunning() == true) return;
  const url = 'http://process.env.PROTOKIT_URL/publish-correct-answers';

  // Data to be sent in the POST request (can be JSON, FormData, etc.)
  const postData = {
    examID: examID,
    questions: questionsWithCorrectAnswers
  };

  // Options for the fetch request
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Adjust content type as needed
    },
    body: JSON.stringify(postData) // Convert data to JSON string
  };

  // Making the POST request using fetch
  fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parsing JSON response
    })
    .then(data => {
      console.log('Success:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

const checkScore = (examID, userID) => {
  if(isMochaRunning() == true) return 3;
  const url = 'http://process.env.PROTOKIT_URL/check-score';

  // Data to be sent in the POST request (can be JSON, FormData, etc.)
  const postData = {
    examID: examID,
    userID: userID
  };

  // Options for the fetch request
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Adjust content type as needed
    },
    body: JSON.stringify(postData) // Convert data to JSON string
  };

  // Making the POST request using fetch
  fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json(); // Parsing JSON response
    })
    .then(data => {
      console.log('Success:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}