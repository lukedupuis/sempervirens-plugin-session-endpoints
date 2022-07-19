import SessionRequestHandler from './session.request-handler.js';

const sessionEndpoints = ({
  sessionDuration = '3h',
  apiBasePath = '/api'
} = {
  sessionDuration: '3h',
  apiBasePath: '/api'
}) => {
  if (apiBasePath.charAt(0) != '/') apiBasePath = `/${apiBasePath}`;
  return [
    {
      path: `GET ${apiBasePath}/session/:action`, // reset, validate
      handler: SessionRequestHandler,
      data: { sessionDuration }
    },
    {
      path: `POST ${apiBasePath}/session/:action`, // start,
      handler: SessionRequestHandler,
      data: { sessionDuration }
    }
  ];
};

export default sessionEndpoints;