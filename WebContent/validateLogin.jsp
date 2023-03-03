<!DOCTYPE html>
<html>
<head>
        <title>Lucas-check Main Page</title>
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
                
                .content {
                  max-width: 250px;
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

<%@ page language="java" import="java.io.*,java.sql.*"%>
<%@ include file="jdbc.jsp" %>
<%
	String authenticatedUser = null;
	session = request.getSession(true);

	try
	{
		authenticatedUser = validateLogin(out,request,session);
	}
	catch(IOException e)
	{	System.err.println(e); }

	if(authenticatedUser != null)
		response.sendRedirect("index.jsp");		// Successful login
	else
		response.sendRedirect("login.jsp");		// Failed login - redirect back to login page with a message 
%>


<%!
	String validateLogin(JspWriter out,HttpServletRequest request, HttpSession session) throws IOException
	{
		String username = request.getParameter("username");
		String password = request.getParameter("password");
		String retStr = null;

		if(username == null || password == null)
				return null;
		if((username.length() == 0) || (password.length() == 0))
				return null;

		try 
		{
			getConnection();
			Statement stmt = con.createStatement(); 
			stmt.execute("USE orders");

			String sql = "SELECT * FROM Customer WHERE userId = ? and password = ?";
			PreparedStatement pstmt = con.prepareStatement(sql);			
			pstmt.setString(1, username);
			pstmt.setString(2, password);
			
			ResultSet rst = pstmt.executeQuery();
					
			if (rst.next())
				retStr = username; // Login successful			
		} 
		catch (SQLException ex) {
			out.println(ex);
		}
		
		if(retStr != null)
		{	session.removeAttribute("loginMessage");
			session.setAttribute("authenticatedUser",username);
		}
		else
			session.setAttribute("loginMessage","Could not connect to the system using that username/password.");

		return retStr;
	}
%>


</body>
</html>