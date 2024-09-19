import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    return { token_hero: {
      isRoot: true,
      version: '1.0.0',
      description: 'token assignment made easy!, head onto /docs to explore more',
      
    } }
  })
}

export default root;
