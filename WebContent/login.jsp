<%@ include file="header.jsp" %>
<!DOCTYPE html>
<html>
  <head>
    <title>Login Screen</title>
    <style>
      body {
        background: linear-gradient(-45deg, #ee7752, red, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        animation: gradient 10s ease infinite;
        height: 100vh;
      }

      h1 {
        font-family: "Dancing Script", cursive;
        font-size: 55px;
        margin-bottom: 30px;
      }

      .wrapper {
        position: absolute;
        top: 50%;
        left: 50%;
      }

      a {
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
        transition: all 0.35s;
      }

      a span {
        position: absolute;
        z-index: 2;
      }

      a:after {
        position: absolute;
        content: "";
        top: 0;
        left: 0;
        width: 0;
        height: 100%;
        background: white;
        transition: all 0.35s;
      }

      a:hover {
        color: #fff;
      }

      a:hover:after {
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
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      }

      th,
      td {
        padding: 5px;
        background-color: rgba(255, 255, 255, 0.2);
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

  <body style="color: white; text-align: center">
    <div class="content">
      <h1>Please Login to System</h1>

      <br />
      <form name="MyForm" method="post" action="validateLogin.jsp">
        <table style="display: inline">
          <tr>
            <td>
              <div align="right">
                <font face="Arial, Helvetica, sans-serif" size="2"
                  >Username:</font
                >
              </div>
            </td>
            <td>
              <input type="text" name="username" size="10" maxlength="10" />
            </td>
          </tr>
          <tr>
            <td>
              <div align="right">
                <font face="Arial, Helvetica, sans-serif" size="2"
                  >Password:</font
                >
              </div>
            </td>
            <td>
              <input type="password" name="password" size="10" maxlength="10" />
            </td>
          </tr>
        </table>
        <br />
        <input class="submit" type="submit" name="Submit2" value="Log In" />
      </form>
    </div>
  </body>
</html>
