/**
 * Adapt an Express handler so async failures reach Express 4's error handler.
 * A controller that resolves without replying or calling next() is also
 * treated as a server error, preventing the request from being left open.
 */
function completeHandler(handler) {
    if (typeof handler !== 'function' || handler.__completionWrapped) return handler;

    const wrapped = function (req, res, next) {
        let passedToNext = false;
        const trackedNext = (error) => {
            passedToNext = true;
            return next(error);
        };

        return Promise.resolve()
            .then(() => handler(req, res, trackedNext))
            .then(() => {
                if (!passedToNext && !res.headersSent && !res.writableEnded) {
                    const error = new Error('Handler completed without sending a response');
                    error.status = 500;
                    return next(error);
                }
            })
            .catch((error) => {
                if (passedToNext || res.headersSent || res.writableEnded) {
                    return next(error);
                }
                return next(error);
            });
    };

    wrapped.__completionWrapped = true;
    return wrapped;
}

function completeController(controller) {
    for (const [name, handler] of Object.entries(controller)) {
        if (typeof handler === 'function') {
            controller[name] = completeHandler(handler);
        }
    }
    return controller;
}

module.exports = { completeHandler, completeController };
