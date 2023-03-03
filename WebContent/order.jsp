<%@ page import="java.sql.*,java.util.Locale" %>
<%@ page import="java.text.NumberFormat" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.Map,java.math.BigDecimal" %>
<%@ include file="jdbc.jsp" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF8"%>
<%@ include file="header.jsp" %>
<!DOCTYPE html>
<html>
<head>
<title>Lucas-check Order Processing</title>
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
  width: 250px;
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
<div class="content">
<% 
// Get customer id
String custId = request.getParameter("customerId");
@SuppressWarnings({"unchecked"})
HashMap<String, ArrayList<Object>> productList = (HashMap<String, ArrayList<Object>>) session.getAttribute("productList");

if (custId == null || custId.equals(""))
	out.println("<h1>Invalid customer id.  Go back to the previous page and try again.</h1>");
else if (productList == null)
	out.println("<h1>Your shopping cart is empty!</h1>");
else
{
	// Check if customer id is a number
	int num=-1;
	try
	{
		num = Integer.parseInt(custId);
	} 
	catch(Exception e)
	{
		out.println("<h1>Invalid customer id.  Go back to the previous page and try again.</h1>");
		return;
	}
        
	String sql = "SELECT customerId, firstName+' '+lastName FROM Customer WHERE customerId = ?";		
			
	NumberFormat currFormat = NumberFormat.getCurrencyInstance(Locale.US);	

	try
	{
		getConnection();
    	Statement stmt = con.createStatement(); 			
		stmt.execute("USE orders");

		PreparedStatement pstmt = con.prepareStatement(sql);
		pstmt.setInt(1, num);
		ResultSet rst = pstmt.executeQuery();
		int orderId=0;
		String custName = "";

		if (!rst.next())
			out.println("<h1>Invalid customer id.  Go back to the previous page and try again.</h1>");
		else
		{	custName = rst.getString(2);

			// Enter order information into database
			sql = "INSERT INTO OrderSummary (customerId, totalAmount, orderDate) VALUES(?, 0, ?);";

			// Retrieve auto-generated key for orderId
			pstmt = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
			pstmt.setInt(1, num);
			pstmt.setTimestamp(2, new java.sql.Timestamp(new Date().getTime()));
			pstmt.executeUpdate();
			ResultSet keys = pstmt.getGeneratedKeys();
			keys.next();
			orderId = keys.getInt(1);

			out.println("<h1>Your Order Summary</h1>");
      	  	out.println("<table><tr><th></th><th>Product Id</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr>");

        	double total =0;
        	Iterator<Map.Entry<String, ArrayList<Object>>> iterator = productList.entrySet().iterator();
        	while (iterator.hasNext())
        	{ 
        		Map.Entry<String, ArrayList<Object>> entry = iterator.next();
                ArrayList<Object> product = (ArrayList<Object>) entry.getValue();
				String productId = (String) product.get(0);
                out.print("<tr><td>"+productId+"</td>");
                out.print("<td>"+product.get(1)+"</td>");
				out.print("<td align=\"center\">"+product.get(3)+"</td>");
                String price = (String) product.get(2);
                double pr = Double.parseDouble(price);
                int qty = ( (Integer)product.get(3)).intValue();
				out.print("<td align=\"right\">"+currFormat.format(pr)+"</td>");
               	out.print("<td align=\"right\">"+currFormat.format(pr*qty)+"</td></tr>");
                out.println("</tr>");
                total = total +pr*qty;

				sql = "INSERT INTO OrderProduct (orderId, productId, quantity, price) VALUES(?, ?, ?, ?)";
				pstmt = con.prepareStatement(sql);
				pstmt.setInt(1, orderId);
				pstmt.setInt(2, Integer.parseInt(productId));
				pstmt.setInt(3, qty);
				pstmt.setString(4, price);
				pstmt.executeUpdate();				
        	}
        	out.println("<tr><td colspan=\"4\" align=\"right\"><b>Order Total</b></td>"
                       	+"<td aling=\"right\">"+currFormat.format(total)+"</td></tr>");
        	out.println("</table>");

			// Update order total
			sql = "UPDATE OrderSummary SET totalAmount=? WHERE orderId=?";
			pstmt = con.prepareStatement(sql);
			pstmt.setDouble(1, total);
			pstmt.setInt(2, orderId);			
			pstmt.executeUpdate();						

			out.println("<h2>Order completed.  Will be shipped soon...</h2>");
			out.println("<h2>Your order reference number is: "+orderId+"</h2>");
			out.println("<h2>Shipping to customer: "+custId+" Name: "+custName+"</h2>");

			out.println("<h2><a href=\"shop.html\">Return to shopping</a></h2>");
			
			// Clear session variables (cart)
			session.setAttribute("productList", null);
		}
	}
	catch (SQLException ex)
	{ 	out.println(ex);
	}	
	finally
	{
		closeConnection();
	}
}
%>
</div>
</body>
</html>

