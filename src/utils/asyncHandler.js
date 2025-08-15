const asyncExpressHandler = (reqHandler) => {
    return (req, res, next) => {
        Promise.resolve(reqHandler(req, res, next))
            .catch((err) => next(err))
    }
}

// const asyncSocketHandler = (socketHandler) => {
//     return (socket, next) => {
//         Promise.resolve(socketHandler(socket, next))
//             .catch(next);
//     };
// };

export default asyncExpressHandler;