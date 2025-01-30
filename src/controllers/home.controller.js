
async function GET(req, res){
  res.json({message:"success", routes: [
    {path: "/api/folders", desc: "shows list of available folders", methods: ["GET"]},
    {path: "/api/:filetype", desc: "shows files of a given type", methods: ["GET"]},
  ]}); // Send the products array as JSON
}

module.exports = {
    GET,
}