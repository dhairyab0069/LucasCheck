<%@ page import="java.sql.*,java.util.Locale" %>
<%@ page import="java.text.NumberFormat" %>
<%@ include file="jdbc.jsp" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF8"%>
<%@ include file="header.jsp" %>
<!DOCTYPE html>
<html>
<head>
<title>Lucas-check Search products</title>
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

	<h1 align="center">🔍 Search for the products you want to buy:</h1>
	<div class="content">
<form method="get" action="listprod.jsp">
	<p align="left">
	<select size="1" name="categoryName">
	<option>All</option>
	<option>Hard Goods</option>
	<option>Soft Goods</option>
	<option>Supplements</option>
	<option>Clothing</option>
	<option>Kids</option>
	<option>Footwear</option>
	</select>
	<input type="text" name="productName" size="50">
	<input type="submit" value="Submit"><input type="reset" value="Reset"></p>
	</form>
<%
	// Get product name to search for
	String name = request.getParameter("productName");
	String category = request.getParameter("categoryName");
	
	boolean hasNameParam = name != null && !name.equals("");
	boolean hasCategoryParam = category != null && !category.equals("") && !category.equals("All");
	String filter = "", sql = "";
	if (hasNameParam && hasCategoryParam)
	{
		filter = "<h3>Products containing '"+name+"' in category: '"+category+"'</h3>";
		name = '%'+name+'%';
		sql = "SELECT productId, productName, price, categoryName FROM Product P JOIN Category C ON P.categoryId = C.categoryId WHERE productName LIKE ? AND categoryName = ?";
	}
	else if (hasNameParam)
	{
		filter = "<h3>Products containing '"+name+"'</h3>";
		name = '%'+name+'%';
		sql = "SELECT productId, productName, price, categoryName FROM Product P JOIN Category C ON P.categoryId = C.categoryId WHERE productName LIKE ?";
	}
	else if (hasCategoryParam)
	{
		filter = "<h3>Products in category: '"+category+"'</h3>";
		sql = "SELECT productId, productName, price, categoryName FROM Product P JOIN Category C ON P.categoryId = C.categoryId WHERE categoryName = ?";
	}
	else
	{
		filter = "<h3>All Products</h3>";
		sql = "SELECT productId, productName, price, categoryName FROM Product P JOIN Category C ON P.categoryId = C.categoryId";
	}
	try 
	{		
		getConnection();
    	Statement stmt = con.createStatement(); 
		stmt.execute("USE orders");

		PreparedStatement pstmt = con.prepareStatement(sql);
		if (hasNameParam)
		{
			pstmt.setString(1, "%" + name + "%");	
			if (hasCategoryParam)
			{
				pstmt.setString(2, category);
			}
		}
		else if (hasCategoryParam)
		{
			pstmt.setString(1, category);
		}

		ResultSet rst2 = pstmt.executeQuery();
		out.println("<table><tr><th></th><th>Product Name</th><th></th><th></th><th>Category</th><th>Price</th></tr>");
		while (rst2.next()) 
		{
			int id = rst2.getInt(1);
			out.print("<td class=\"col-md-1\"><a href=\"addcart.jsp?id=" + id + "&name=" + rst2.getString(1)
				+ "&price=" + rst2.getString(3) + "\">Add to Cart</a></td>");

			String itemCategory = rst2.getString(3);
			out.print("<td><a href=\"product.jsp?id=" + rst2.getInt(1) + "\">"+rst2.getString(2)+"</a></td>");
			out.println("<td>" + "</td>" +"<td>"+"</td>"+ "<td>"+rst2.getString(4) +"</td>"+"<td>"+ rst2.getString(3)
					+ "</td></tr>");
		}
		out.println("</table>");
	} 
	catch (SQLException ex) 
	{
		//throw ex;
	} 	
	finally
	{
		closeConnection();
	}
%>
</div>
<br>
<br>
</body>
</html>