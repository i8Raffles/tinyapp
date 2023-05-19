# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of urls page"](https://github.com/i8Raffles/tinyapp/blob/master/docs/urls_page.PNG?raw=true)
!["Screenshot of new url page"](https://github.com/i8Raffles/tinyapp/blob/master/docs/new_url_page.PNG?raw=true)
!["Screenshot of login page"](https://github.com/i8Raffles/tinyapp/blob/master/docs/login_page.PNG?raw=true)
!["Screenshot of edit page"](https://github.com/i8Raffles/tinyapp/blob/master/docs/edit_page.PNG?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- In your browser head to http://localhost:8080/ to access TinyApp

## Using TinyApp

### Register

Upon going to the link in getting started, you will be at the login page. To begin shortening URLs, you can click the Register button to the right and get started with an email and password of your choice.

### Main Page My URLs

After logging in/registering, you will be able to view all your short URL's and long URL's at this page. You can create a new short url, edit and delete an already existing url of your choice

### Create New Links

Once you are logged in, you can click Create New URL from the navigation bar or through the Create New Short Link button from the My URLs page to create a new short url for a website of your choice.

### Editing and Redirecting to Link

Upon adding a link you'll be taken to a page showing the long URL and a short URL link which you can follow to the actual website. Below the link you can also input a different website if you'd like to edit the website link instead.