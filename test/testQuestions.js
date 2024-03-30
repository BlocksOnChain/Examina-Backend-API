const questions = [
	{
		exam: "", // Exam ID'si buraya eklenecek
		number: 1,
		text: "What is the capital of France?",
		description: "Choose the correct option.",
		options: [
			{ number: 1, text: "London" },
			{ number: 2, text: "Paris" },
			{ number: 3, text: "Berlin" },
			{ number: 4, text: "Madrid" },
		],
		correctAnswer: 2, // Paris
	},
	{
		exam: "", // Exam ID'si buraya eklenecek
		number: 2,
		text: "What is the chemical symbol for water?",
		description: "Choose the correct chemical symbol.",
		options: [
			{ number: 1, text: "H2O" },
			{ number: 2, text: "CO2" },
			{ number: 3, text: "O2" },
			{ number: 4, text: "NaCl" },
		],
		correctAnswer: 1, // H2O
	},
	{
		exam: "", // Exam ID'si buraya eklenecek
		number: 3,
		text: "Which planet is known as the Red Planet?",
		description: "Choose the correct option.",
		options: [
			{ number: 1, text: "Mars" },
			{ number: 2, text: "Venus" },
			{ number: 3, text: "Jupiter" },
			{ number: 4, text: "Saturn" },
		],
		correctAnswer: 1, // Mars
	},
];

module.exports = { questions };
