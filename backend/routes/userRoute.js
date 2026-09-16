const express = require("express");
const {authenticate,authorizeUser,} = require("../middleware/auth")
const {createCall,getCall,getCallHistory,acceptCall,rejectCall,endCall,addTranscriptSegment} = require("../controllers/userController");

const router = express.Router();

router.post("/",authenticate,authorizeUser,createCall);

router.get("/",authenticate,authorizeUser,getCallHistory);

router.get("/:callId",authenticate,authorizeUser,getCall);

router.post("/:callId/accept",authenticate,authorizeUser,acceptCall);

router.post("/:callId/reject",authenticate,authorizeUser,rejectCall);

router.post("/:callId/end",authenticate,authorizeUser,endCall);

router.post("/:callId/transcript",authenticate,authorizeUser,addTranscriptSegment);

module.exports = router;