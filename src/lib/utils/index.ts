const defaultHTML = `
<!DOCTYPE html>
<html>

<head>
     <meta charset="utf-8" />
     <meta http-equiv="X-UA-Compatible" content="IE=edge">
     <title>Dough!</title>
     <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<body>
     <h1>Dough! Something Went Wrong!</h1>
</body>

</html>
`;

const getDefaultView = () => {
    return defaultHTML;
};

module.exports = {
    getDefaultView,
};
