import Express from "express";
import parser from "body-parser";
import cookie from "cookie-session";

import redis from "../middlewares/redis";
import { hash, validate } from "../middlewares/password";

import sessions from "./sessions";
import students from "./students";

const api = Express.Router();
const isAdmin = (req, res, next) => ( req.session.isAdmin ? next() : res.sendStatus( 401 ));

api.use(
  parser.urlencoded({ extended: false }), //req.params
  parser.json(),                          //req.body
  cookie({ name: "session", keys: ["Riasec", "Polytech"], maxAge: 0 }) //req.session
)

/**
* @desc Logging route for admin
* @route POST api/log
* @param {String} identifier
* @param {String} password
* GIVE A COOKIE
*/
api.use( "/log", (req, res) => (
  Promise.resolve( req )
  .then(({ session, body }) => session.isAdmin ? Promise.reject( "connected" ) : body )
  .then(({ email, password }) => (
    redis.getAdmin( email )
    .then( logPass => (( logPass && validate( logPass, password )) ? (
      ( req.session.isAdmin = true ) && res.send( true ).status( 200 )
    ) : ( res.sendStatus( 401 ))
    ))
  ))
  .catch( error => error === "connected" ? res.send( true ).status( 200 ) : Promise.reject( error ))
  .catch( error => console.error( error ) || res.sendStatus( 500 ))
));

/******************************************************************************/
/*************************** SESSIONS & CHARTS DATA ***************************/
/******************************************************************************/
api.use( "/sessions", sessions );
/******************************************************************************/
/********************************* STUDENTS ***********************************/
/******************************************************************************/
api.use( "/student", students );
/******************************************************************************/
/********************************* QUESTIONS **********************************/
/******************************************************************************/

api.get( "/statements/", (req, res) => (
  redis.getAllStatementSets()
  .then( statementSets => res.json( statementSets ))
  .catch( error => console.error( error ) || res.sendStatus( 500 ))
))

/**
* @desc get the desired set of affirmations.
* @route GET /api/questions/:questionid
*/
api.get( "/statements/:statementSet", (req, res) => (
  redis.getStatementSet( req.params.statementSet )
  .then( statementSet => statementSet ? res.status( 200 ).json( statementSet ) : res.sendStatus( 404 ))
  .catch( error => console.error( error ) || res.sendStatus( 500 ))
))

export default api;
