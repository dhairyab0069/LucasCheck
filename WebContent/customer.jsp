<%@ include file="header.jsp" %>
<!DOCTYPE html>
<html>
<head>
<title>Customer Page</title>
<style>
	body {
		background: linear-gradient(-45deg, #ee7752, red, #23a6d5, #23d5ab);
		background-size: 400% 400%;
		animation: gradient 10s ease infinite;
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
	  font-size: 55px;
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

	p {
  font-size: 2rem;
  text-align: center;
     }

	
	.content {
	  max-width: 800px;
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
		padding: 5px;
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
<body text="white">
	<h1 style= "text-align: center">Customer Profile</h1>
	<div class="content">
<%@ include file="auth.jsp"%>
<%@ page import="java.text.NumberFormat" %>
<%@ include file="jdbc.jsp" %>

<%
    String userName = (String) session.getAttribute("authenticatedUser");
%>

<%

// TODO: Print Customer information
String sql = "select customerId, firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password from customer WHERE userid = ?";
 String url = "jdbc:sqlserver://cosc304_sqlserver:1433;database=orders;TrustServerCertificate=True";
 String uid = "sa";
 String pw = "304#sa#pw";
NumberFormat currFormat = NumberFormat.getCurrencyInstance();
try 
(Connection con = DriverManager.getConnection(url, uid, pw);
Statement stmt = con.createStatement();)
{
   
    PreparedStatement pstmt = con.prepareStatement(sql);
    pstmt.setString(1, userName);
    ResultSet rst = pstmt.executeQuery();

    if (rst.next())
    {
		out.println("<table>");
        out.println("<tr><th>Id</th><td>"+rst.getString(1)+"</td></tr>");
        out.println("<tr><th>First Name</th><td>"+rst.getString(2)+"</td></tr>");
        out.println("<tr><th>Last Name</th><td>"+rst.getString(3)+"</td></tr>");
        out.println("<tr><th>Email</th><td>"+rst.getString(4)+"</td></tr>");
        out.println("<tr><th>Phone</th><td>"+rst.getString(5)+"</td></tr>");
        out.println("<tr><th>Address</th><td>"+rst.getString(6)+"</td></tr>");
        out.println("<tr><th>City</th><td>"+rst.getString(7)+"</td></tr>");
        out.println("<tr><th>State</th><td>"+rst.getString(8)+"</td></tr>");
        out.println("<tr><th>Postal Code</th><td>"+rst.getString(9)+"</td></tr>");
        out.println("<tr><th>Country</th><td>"+rst.getString(10)+"</td></tr>");
        out.println("<tr><th>User id</th><td>"+rst.getString(11)+"</td></tr>");
        out.println("</table>");
    }
}
catch (SQLException ex) 
{     out.println(ex); 
}
%>
	</div>

</body>
</html>