import { useEffect, useState } from "react";
import axios from "axios";

export function useGetRequestScore() {
    const [Score, setScore] = useState("");

    async function featchScore() {
        try {
            const response = await axios.get("http://localhost:2001/api/tic-tac-toe/score");

            setScore(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        featchScore();
    }, [Score])

    return { Score, featchScore};
}