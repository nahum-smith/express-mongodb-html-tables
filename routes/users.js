var express = require('express');
var router = express.Router();
var DB = require('../database/dbInit.js')

/* GET users listing. */
router.get('/', async function (req, res, next) {
  let {
    page,
    nPerPage
  } = req.query

  page = page == undefined ? 1 : parseInt(page)
  nPerPage = nPerPage == undefined ? 20 : parseInt(nPerPage)

  console.log(req.query)

  console.log('Page', page, 'per page', nPerPage)
  const db = await DB.Get()
  const coll = db.collection("people")

  let r = await coll.find().project({
    first_name: 1,
    last_name: 1,
    quote: 1,
    employer: 1
  })
  var count = await r.count()
  var pages = Math.floor(count / nPerPage)
  var skip = Math.floor((page - 1) * nPerPage)

  var users = await r.skip(skip).limit(nPerPage).toArray()

  res.json({
    ok: true,
    status: 200,
    pages,
    count,
    users
  })
});

module.exports = router;