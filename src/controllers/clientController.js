import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Client from '../models/clientModel.js'

let refreshTokens = [];

const clientController = {
    //REGISTER
    registerClient: async (req, res) => {
        try {
            // Check if name or email already exists
            const existingClient = await Client.findOne({
                $or: [{ name: req.body.name }, { email: req.body.email }]
            });

            if (existingClient) {
                return res.status(400).json({
                    success: false,
                    message: "name or email already exists"
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            //Create new Client
            const newClient = await new Client({
                name: req.body.name,
                email: req.body.email,
                password: hashed,
                gender: req.body.gender,
                birthday: req.body.birthday
            });

            //Save Client to DB
            const client = await newClient.save();
            res.status(200).json(client);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    generateAccessToken: (Client) => {
        return jwt.sign(
            {
                id: Client.id,
                gender: Client.gender,
            },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "30s" }
        );
    },

    generateRefreshToken: (client) => {
        return jwt.sign(
            {
                id: client.id,
                gender: client.gender,
            },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "365d" }
        );
    },

    //LOGIN
    loginClient: async (req, res) => {
        try {
            const client = await Client.findOne({
                $or: [{ name: req.body.name }, { email: req.body.email }]
            });
            if (!client) {
                return res.status(404).json("Incorrect username or email");
            }

            const validPassword = await bcrypt.compare(
                req.body.password,
                client.password
            );
            if (!validPassword) {
                return res.status(404).json("Incorrect password");
            }

            if (client && validPassword) {
                //Generate access token
                const accessToken = clientController.generateAccessToken(Client);
                //Generate refresh token
                const refreshToken = clientController.generateRefreshToken(Client);
                refreshTokens.push(refreshToken);
                //STORE REFRESH TOKEN IN COOKIE
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: "/",
                    sameSite: "strict",
                });
                const { password, ...others } = client._doc;
                res.status(200).json({ ...others, accessToken });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    requestRefreshToken: async (req, res) => {
        //Take refresh token from Client
        const refreshToken = req.cookies.refreshToken;
        //Send error if token is not valid
        if (!refreshToken) {
            return res.status(401).json("You're not cliententicated");
        }
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json("Refresh token is not valid");
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, Client) => {
            if (err) {
                console.log(err);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            //create new access token, refresh token and send to Client
            const newAccessToken = clientController.generateAccessToken(Client);
            const newRefreshToken = clientController.generateRefreshToken(Client);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict",
            });
            res.status(200).json({ accessToken: newAccessToken });
        });
    },

    //LOG OUT
    logOut: async (req, res) => {
        //Clear cookies when Client logs out
        refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
        res.clearCookie("refreshToken");
        res.status(200).json("Logged out successfully!");
    },
};

export default clientController