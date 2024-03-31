import { Router } from "express";
const router = Router();
import { find } from "../models/User";//Generate user route for get all users
router.get("/", async (req, res) => {
    try {
        const users = await find();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.render("error/500");
    }
});

export default router;