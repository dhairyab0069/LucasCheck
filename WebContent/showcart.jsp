<%@ page import="java.util.HashMap" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.text.NumberFormat" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.Locale" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF8"%>
<%@ include file="header.jsp" %>
<!DOCTYPE html>
<html>
<head>
<title>Your Shopping Cart</title>
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
  font-size: 80px;
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
<br>
<h1 style="text-align: center"> 🛍️Your Shopping Cart</h1>
<div class="content">
	<script>
		function update(newid, newqty)
		{
			window.location="showcart.jsp?update="+newid+"&newqty="+newqty;
		}
		</script>
		<form name="form1">

	<%
	// Get the current list of products
	@SuppressWarnings({"unchecked"})
	HashMap<String, ArrayList<Object>> productList = (HashMap<String, ArrayList<Object>>) session.getAttribute("productList");
		ArrayList<Object> product = new ArrayList<Object>();
			String del = request.getParameter("delete");
			String up = request.getParameter("update");
			String newqty = request.getParameter("newqty");
	if (productList == null)
	{	out.println("<H1>Your shopping cart is empty!</H1>");
		productList = new HashMap<String, ArrayList<Object>>();
	}
	else
	{
		NumberFormat currFormat = NumberFormat.getCurrencyInstance(Locale.US);
		if(del != null && (!del.equals(""))) {
			if(productList.containsKey(del)) {
				productList.remove(del);
			}
		}
		if(up != null && (!up.equals(""))) {
			if (productList.containsKey(up)) { // find item in shopping cart
				product = (ArrayList<Object>) productList.get(up);
				product.set(3, (new Integer(newqty))); // change quantity to new quantity
			}
			else {
				productList.put(del,product);
			}
		}
	
		out.print("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
		out.println("<th></th><th></th><th>Price</th><th>Subtotal</th><th></th></tr>");
	
		int c = 0;
		double total =0;
		Iterator<Map.Entry<String, ArrayList<Object>>> iterator = productList.entrySet().iterator();
		while (iterator.hasNext()) 
		{	c++;
			Map.Entry<String, ArrayList<Object>> entry = iterator.next();
			ArrayList<Object> prod = (ArrayList<Object>) entry.getValue();
			if (prod.size() < 4)
			{
				out.println("Expected product with four entries. Got: "+product);
				continue;
			}
			out.print("<td>"+prod.get(0)+"</td>");
			out.print("<td>"+prod.get(1)+"</td>");
	
			out.print("<td align=\"center\"><input type=\"text\" name=\"newqty"+c+"\" size=\"5\" value=\""
				+prod.get(3)+"\"></td>");
			out.print("<td><a href=\"showcart.jsp?delete=" +prod.get(0)+"\">Remove Item</a></td>");
			Object price = prod.get(2);
			Object itemqty = prod.get(3);
			double pr = 0;
			int qty = 0;
			
			try
			{
				pr = Double.parseDouble(price.toString());
			}
			catch (Exception e)
			{
				out.println("Invalid price for product: "+product.get(0)+" price: "+price);
			}
			try
			{
				qty = Integer.parseInt(itemqty.toString());
			}
			catch (Exception e)
			{
				out.println("Invalid quantity for product: "+product.get(0)+" quantity: "+qty);
			}		
	
			out.print("<td></td><td align=\"right\">"+currFormat.format(pr)+"</td>");
			out.print("<td>"+currFormat.format(pr*qty)+"</td>");
			
			out.print("<td><input type=\"button\" onclick=\"up("+prod.get(3)+", document.form1.newqty"+c+".value)\" value=\"Update Quantity\"></td></tr>");
			total = total +pr*qty;
		}
			out.println("<tr><td></td><td><td></td></td><td colspan=\"4\" align=\"right\"><b>Order Total</b></td>"
				+"<td align=\"right\">"+currFormat.format(total)+"</td></tr>");
			out.println("</table>");
	
			out.println("<h2><a href=\"checkout.jsp\">Check Out</a></h2>");
	}
	session.setAttribute("productList", productList);
	%>

<h2><a href="listprod.jsp">Continue Shopping</a></h2>
</div>
</body>
</html> 

