import express from "express";
import bodyParser from "body-parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import twilio from "twilio";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Blood Donation",
  password: "123",
  port: 5432,
});


const accountSid = 'ACa7409990e8d0c4ebd61d7d4e0ab81c4e';
const authToken = '4393365948db0b84764b071c99330357';
const client = twilio(accountSid, authToken);


const twilioPhoneNumber = '+18659786384';
const targetPhoneNumbers = [
  '+918688006905', 
  '+9163059 48355',
  '+9181431 43841',
  '+9194412 02279',
  '+919550096569',
 
];

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
db.connect();

app.get('/', (req, res) => {
  res.render("index.ejs");
});

app.get("/signin", (req, res) => {
  res.render("signin.ejs");
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.get("/Needblood", async (req, res) => {
  const data = await db.query("select * from BloodGroup_A_Positive");
  const data1 = await db.query("select * from BloodGroup_A_Negative");
  const data2 = await db.query("select * from BloodGroup_B_Positive");
  const data3 = await db.query("select * from BloodGroup_B_Negative");
  const data4 = await db.query("select * from BloodGroup_AB_Positive");
  const data5 = await db.query("select * from BloodGroup_AB_Negative");
  const data6 = await db.query("select * from BloodGroup_O_Positive");
  const data7 = await db.query("select * from BloodGroup_O_Negative");
  res.render("Needblood.ejs", {
    data: data.rows,
    data1: data1.rows,
    data2: data2.rows,
    data3: data3.rows,
    data4: data4.rows,
    data5: data5.rows,
    data6: data6.rows,
    data7: data7.rows,
  });
});

app.post("/signin", async (req, res) => {
  try {
    console.log(req.body["blood-group"]);

    await db.query(
      "INSERT INTO login(name, email, password, contactno, bloodgroup) VALUES ($1, $2, $3, $4, $5)", 
      [req.body["name"], req.body["email"], req.body["password"], req.body["phonenumber"], req.body["blood-group"]]
    );

    if (req.body["blood-group"] === "A+ve") {
      await db.query(
        "INSERT INTO BloodGroup_A_Positive(name) VALUES($1)", 
        [req.body["name"]]
      )
    }else if(req.body["blood-group"] === "A-ve"){
      await db.query(
        "INSERT INTO BloodGroup_A_Negative(name) VALUES($1)", 
        [req.body["name"]]
      )
    }else if(req.body["blood-group"] === "B-ve"){
      await db.query(
        "INSERT INTO BloodGroup_B_Negative(name) VALUES($1)", 
        [req.body["name"]]
      )
    }else if(req.body["blood-group"] === "O-ve"){
      await db.query(
        "INSERT INTO BloodGroup_0_Negative(name) VALUES($1)", 
        [req.body["name"]]
      )
    }else if(req.body["blood-group"] === "O+ve"){
      await db.query(
        "INSERT INTO BloodGroup_0_Positive(name) VALUES($1)", 
        [req.body["name"]]
      )
    }else if(req.body["blood-group"] === "AB+ve"){
      await db.query(
        "INSERT INTO BloodGroup_ab_Positive(name) VALUES($1)", 
        [req.body["name"]]
      )
    }else if(req.body["blood-group"] === "AB-ve"){
      await db.query(
        "INSERT INTO BloodGroup_ab_negative(name) VALUES($1)", 
        [req.body["name"]]
      )
    }else if(req.body["blood-group"] === "B+ve"){
      await db.query(
        "INSERT INTO BloodGroup_b_positive(name) VALUES($1)", 
        [req.body["name"]]
      )
    }

    res.redirect("/signup");

  } catch (error) {
    console.error("Error during sign in:", error);
    res.status(500).send("An error occurred during sign in. Please try again.");
  }
});


app.get("/home", (req, res) => {
  res.render("RealHome.ejs");
});

app.post("/signup", async (req, res) => {
  console.log(req.body["email"]);
  const result = await db.query("SELECT * FROM login WHERE email = $1", [req.body["email"]]);
  const data = result.rows[0];
  if (req.body["password"] == data.password) {
    console.log(result.rows);
    res.redirect("/home");
  } else {
    res.send("INCORRECT PASSWORD");
  }
});
app.get("/succesful",(req,res)=>{
  res.render("requestSent.ejs");
})

app.post("/send-request", async (req, res) => {
  const { name, contact, bloodGroup, address } = req.body;

  const messageBody = `We need Blood \nName: ${name}\nContact: ${contact}\nBlood Group: ${bloodGroup}\nAddress: ${address}`;

  targetPhoneNumbers.forEach(to => {
    client.messages.create({
      body: messageBody,
      from: twilioPhoneNumber,
      to: to
    }).then(message => {
      console.log(`Message sent to ${to} with SID: ${message.sid}`);
    }).catch(error => {
      console.error(`Error sending message to ${to}:`, error);
    });
  });

  res.redirect("/succesful")
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
