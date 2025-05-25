const express = require("express");
const {
  verifyToken,
  roleGuard,
  validateLibrarySchema,
} = require("../middlewares/middlewares.js");
const {
  validateUser,
  valAdminRegisterSchm,
} = require("../middlewares/validationMiddleware.js");

const libraryController = require("../controllers/libraryController.js");
const { getBooksBylibray } = require("../controllers/bookController.js");
const router = express.Router();

// create
router.post(
  "/",
  validateLibrarySchema,
  verifyToken,
  roleGuard("admin"),
  libraryController.create
);
//get lib by owner
router.get("/", verifyToken, roleGuard("owner"), libraryController.getLib);
//update
router.put("/", verifyToken, roleGuard("owner"), libraryController.updateLib);
// delete library
router.delete(
  "/:library_id",
  verifyToken,
  roleGuard("admin"),
  libraryController.deleteLib
);

/// MEMBERS
router.post(
  "/members",
  validateUser,
  verifyToken,
  roleGuard("owner"),
  libraryController.addMember
);

/// MEMBERS
router.post(
  "/member",
  verifyToken,
  roleGuard("owner"),
  libraryController.addMemberWithUsername
);
router.get(
  "/members",
  verifyToken,
  roleGuard("owner"),
  libraryController.getLibraryMembers
);
// get member by id
router.get(
  "/members/:member_id",
  verifyToken,
  roleGuard("owner"),
  libraryController.getMemberById
);
router.delete(
  "/members/:member_id",
  verifyToken,
  roleGuard("owner"),
  libraryController.removeMember
);
router.put(
  "/members/:member_id/edit",
  validateUser,
  verifyToken,
  roleGuard("owner"),
  libraryController.updateMember
);
router.get("/books", verifyToken, roleGuard("owner"), getBooksBylibray);
// get library details total books, members and active rentals count and library name
router.get(
  "/details",
  verifyToken,
  roleGuard("owner"),
  libraryController.getLibDetailsForOwner
);

module.exports = router;
