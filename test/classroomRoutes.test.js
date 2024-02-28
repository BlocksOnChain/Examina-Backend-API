const request = require("supertest");
const app = require("../app");

describe("Classroom endpoints", () => {
	let classroomId;

	// POST /classrooms endpoint testi
	it("should create a new classroom", async () => {
		const res = await request(app)
			.post("/classrooms")
			.send({
				name: "Test Classroom",
				teacherId: "teacher123",
				studentIds: ["student1", "student2"],
			});
		expect(res.statusCode).toEqual(200);
		expect(res.body).toHaveProperty("_id");
		classroomId = res.body._id;
	});

	// GET /classrooms/user/:userId endpoint testi
	it("should get classrooms of a user", async () => {
		const res = await request(app).get("/classrooms/user/teacher123");
		expect(res.statusCode).toEqual(200);
		expect(res.body.length).toBeGreaterThanOrEqual(1);
	});

	// GET /classrooms/student/:studentId endpoint testi
	it("should get classrooms of a student", async () => {
		const res = await request(app).get("/classrooms/student/student1");
		expect(res.statusCode).toEqual(200);
		expect(res.body.length).toBeGreaterThanOrEqual(1);
	});
});
