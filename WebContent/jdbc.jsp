<!--
A JSP file that encapsulates database connections.

Public methods:
- public void getConnection() throws SQLException
- public void closeConnection() throws SQLException  
-->

<%@ page import="java.sql.*"%>

<%!
	// User id, password, and server information
	private String url = "jdbc:sqlserver://cosc304_sqlserver:1433;TrustServerCertificate=True";
	private String uid = "sa";
	private String pw = "304#sa#pw";

	// Connection
	private Connection con = null;
%>

<%!
	public void getConnection() throws SQLException 
	{
		try
		{	// Load driver class
			Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
		}
		catch (java.lang.ClassNotFoundException e)
		{
			throw new SQLException("ClassNotFoundException: " +e);
		}
	
		con = DriverManager.getConnection(url, uid, pw);
		Statement stmt = con.createStatement();
	}
   
	public void closeConnection() throws SQLException 
	{
		try {
			if (con != null)
				con.close();
			con = null;
		}
		catch (Exception e)
		{ }
	}
%>
