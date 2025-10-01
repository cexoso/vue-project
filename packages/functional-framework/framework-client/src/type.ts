import Axios from 'axios'

export type ResponseInterceptors = Parameters<(typeof Axios)['interceptors']['response']['use']>[0]
