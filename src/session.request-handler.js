import authorizer from '@sempervirens/authorizer';
import { RequestHandler } from '@sempervirens/endpoint';

class SessionRequestHandler extends RequestHandler {

  constructor({ req, res, data, isSecure }) {
    super({ req, res, data, isSecure });
    this.init(req.params, req.body);
  }

  init({ action }, body) {
    try {
      const data = {};
      if (action == 'start') {
        data.token = this.#start(body);
      } else if (action == 'validate') {
        data.isValid = this.#validate();
      } else if (action == 'reset') {
        data.token = this.#reset();
      } else if (action == 'stop') {
        this.#stop();
      }
      this.send({ data });
    } catch(error) {
      this.error({ number: 453081, error });
    }
  }

  #start(body) {
    return authorizer.encrypt({
      expiresIn:
        process.env.CLIENT_SESSION_DURATION
        || this.data.sessionDuration
        || '3h',
      data: body
    });
  }

  #validate() {
    return authorizer.isValid(this.req);
  }

  #reset() {
    if (!authorizer.isValid(this.req)) {
      throw new Error('USER_ERROR: Invalid token');
    }
    return authorizer.reset(this.req);
  }

  #stop() {
    authorizer.invalidate(this.req);
  }

}

export default SessionRequestHandler;