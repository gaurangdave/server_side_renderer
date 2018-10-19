# OpenFaas function for Server Side Rendering

## Why?
Single page applications render the view after loading the libraries on the client. Since the application doesn't require any page reloading, any susequent views are loaded faster. But since these are rendered on client side they have certain limitations, 
* Client side rendering is not SEO friendly.
* Sharing links in social media sites doesn't render actual content of the application
* Since the application waits for the libraries to load before rendering the view, the fist intractive paint can be slower depending on user connection. 

Server side rendering solves all of the above problems. With server side rendering the server returns a fully rendered HTML content which the browsers can quickly render without waiting for the libraries to load.  Search engine crawlers can easily read the server side rendered content and it can be userd for serch engine optimization as well.  Same applies to rendering links for social media sites. 

## What?
This project attempts to solve the problem by creating a generic OpenFaas function that accepts the app name and path as parameters and returns corresponding html view for the app.  The idea is to create a generic config based function that can render any SPA app independent of the framework. 

## How?
* The app relies on having a `Minio` object server available to read the config and any other required objects to create the template. 
-   Create a `minio.config.json` file in following format to run the code during development.

```
{
     "endPoint": "xxx.xxx.xxx.xxx",
     "port": 9000,
     "useSSL": false,
     "accessKey": "##########",
     "secretKey": "##########"
}
```

-   To run the function as `OpenFaas` function in production, create a docker secret like so,
    `docker secret create my_secret ./secret.json`

*   Make the secret available to `OpenFaas` function by adding it in `.yml` file,

```
   secrets:
      - my_secret
```
