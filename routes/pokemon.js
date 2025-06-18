import express from 'express';
import axios from 'axios';
import env from 'dotenv';

env.config();

const router = express.Router();
const API_URL = process.env.API_URL;

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;
        const response = await axios.get(`${API_URL}?limit=${limit}&offset=${offset}`);
        const totalCount = 1008; // Total number of Pokemon
        const totalPages = Math.ceil(totalCount / limit);
        
        // Fetch basic info for each Pokemon to get their images
        const pokemonDetailsPromises = response.data.results.map(pokemon => 
            axios.get(pokemon.url).then(res => ({
                name: pokemon.name,
                image: res.data.sprites.front_default
            }))
        );
        
        const pokemonDetails = await Promise.all(pokemonDetailsPromises);
        
        res.render("pages/home", { 
            pokemonList: pokemonDetails,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching Pokémon data");
    }
})


router.get("/pokemon/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        res.render("pages/details", { pokemon: response.data })
    } catch (error) {
        res.status(500).send("Error fetching Pokémon data");
    }
})


router.get("/search", async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.redirect("/");
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        res.render("pages/details", { pokemon: response.data });
    } catch (error) {
        res.status(500).send("Error fetching Pokémon data");
    }
})

export default router;