<%@ page import="java.util.HashMap" %>
<%@ page import="java.text.NumberFormat" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF8"%>
<%@ include file="jdbc.jsp" %>

<html>
<head>
<title>Lucas-chek - Product Information</title>
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

<div class="content">

<%@ include file="header.jsp" %>

<%
// Get product name to search for
String productId = request.getParameter("id");
String url = "jdbc:sqlserver://cosc304_sqlserver:1433;DatabaseName=orders;TrustServerCertificate=True";
String uid = "sa";
String pw = "304#sa#pw";

NumberFormat currFormat = NumberFormat.getCurrencyInstance();
try (Connection con = DriverManager.getConnection(url, uid, pw);
Statement stmt = con.createStatement();)
{
	
    String sql = "SELECT productId, productName, price, productImageURL FROM product WHERE productId = ?";
	PreparedStatement pstmt = con.prepareStatement(sql);
	pstmt.setInt(1, Integer.parseInt(productId));			
	
	ResultSet rst = pstmt.executeQuery();
			
	rst.next();
			
		out.println("<h2>"+rst.getString(2)+"</h2>");
		
		int pId = rst.getInt(1);
		out.println("<table><tr>");
		out.println("<th>Id</th><td>" + productId + "</td></tr>"				
				+ "<tr><th>Price</th><td>" + currFormat.format(rst.getDouble(3)) + "</td></tr>");
		
		//  Retrieve any image with a URL
		String imageurl = rst.getString(4);
		if (imageurl != null)
	 	out.println("<img src=\""+imageurl+"\">");
		
		// Retrieve any image stored directly in database
		//String imageBinary = rst.getString(5);
		//if (imageBinary != null)
		//	out.println("<img src=\"displayImage.jsp?id="+productId+"\">");	
		out.println("</table>");
		
		out.println("<h3><a href=\"addcart.jsp?id="+productId+ "&name=" + rst.getString(2)
								+ "&price=" + rst.getDouble(3)+"\">Add to Cart</a></h3>");		
		
		out.println("<h3><a href=\"listprod.jsp\">Continue Shopping</a>");
	
} 
catch (SQLException ex) {
	out.println(ex);
}

%>
<br>
<br>
<br>
</div>

</body>
</html>