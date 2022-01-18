const host = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
export const environment = {
  production: true,
  apiUrl: host+'/api/v1/',
  ImageUrl: host+'/assets/',
  samplefileurl : host+"/v1/samplefile/",
  SOCKET_ENDPOINT: host
};
