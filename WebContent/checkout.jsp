<%@ include file="header.jsp" %>
<!DOCTYPE html>
<html>
<head>
<title> Lucas-check CheckOut Line</title>
<style>
               
    body {
    background: linear-gradient(-45deg, #ee7752, red, #23a6d5, #23d5ab);
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
    height: 100vh;
}
@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }
 
    50% {
        background-position: 100% 50%;
    }
 
    100% {
        background-position: 0% 50%;
    }
}
h1 {
  font-family: 'Dancing Script', cursive;
  font-size: 60px;
  margin-bottom: 30px;
}

.wrapper{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

a{
  display: block;
  width: 200px;
  height: 40px;
  line-height: 40px;
  font-size: 18px;
  font-family: sans-serif;
  text-decoration: none;
  color: #333;
  border: 2px solid #333;
  letter-spacing: 2px;
  text-align: center;
  position: relative;
  transition: all .35s;
}

a span{
  position: absolute;
  z-index: 2;
}

a:after{
  position: absolute;
  content: "";
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: white;
  transition: all .35s;
}

a:hover{
  color: #fff;
}

a:hover:after{
  width: 100%;
}

.content {
  max-width: 700px;
  margin: auto;
}
table {
	width: 800px;
	border-collapse: collapse;
	overflow: hidden;
	box-shadow: 0 0 20px rgba(0,0,0,0.1);
}

th,
td {
	padding: 15px;
	background-color: rgba(255,255,255,0.2);
	color: #fff;
}

th {
	text-align: left;
}

th {
		background-color: #8795d3;
	}


</style>
</head>
<body style="color:white">

<h1>Enter your customer id to complete the transaction:</h1>

<form method="get" action="order.jsp">
<input type="text" name="customerId" size="50">
<input type="submit" value="Submit"><input type="reset" value="Reset">
</form>

</body>
</html>

