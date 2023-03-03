<%@ include file="header.jsp" %>
<!DOCTYPE html>
<html>
<head>
<title>Administrator Page</title>
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
<body style="color: white">
	<div class="content">

    <%@ include file="../auth.jsp"%>
    <%@ page import="java.text.NumberFormat" %>
    <%@ include file="jdbc.jsp" %>
    
    <%
        String userName = (String) session.getAttribute("authenticatedUser");
    %>
    
    <%
    // Print out total order amount by day
    String sql = "select year(orderDate), month(orderDate), day(orderDate), SUM(totalAmount) FROM orderSummary GROUP BY year(orderDate), month(orderDate), day(orderDate)";
    String url = "jdbc:sqlserver://cosc304_sqlserver:1433;DatabaseName=orders;TrustServerCertificate=True";
    String uid = "sa";
    String pw = "304#sa#pw";
    NumberFormat currFormat = NumberFormat.getCurrencyInstance();
    try(Connection con = DriverManager.getConnection(url, uid, pw);
    Statement stmt = con.createStatement();)
    {	
        out.println("<h1>Administrator Sales Report by Day</h1>");
        
        getConnection();
        ResultSet rst = con.createStatement().executeQuery(sql);		
        out.println("<table class=\"table\" border=\"1\">");
        out.println("<tr><th>Order Date</th><th>Total Order Amount</th>");	
        while (rst.next())
        {
            out.println("<tr><td>"+rst.getString(1)+"-"+rst.getString(2)+"-"+rst.getString(3)+"</td><td>"+currFormat.format(rst.getDouble(4))+"</td></tr>");
        }
        out.println("</table>");		
    }
    catch (SQLException ex) 
    { 	out.println(ex); 
    }
    finally
    {	
        closeConnection();	
    }
    %>
    </div>

</body>
</html>

