const k8s = require('@kubernetes/client-node')
const yaml = require('js-yaml')
const np = require('nested-property')

const logger = require('./logger')
const ns = 'emphasis'

const pod = async (name, prop) => {
  const kc = new k8s.KubeConfig()
  kc.loadFromDefault()
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api)

  // console.log(await (await k8sApi.listNamespacedPod(ns)).body)

  try {
    const data = await k8sApi.readNamespacedPod(name, ns)
    const value = np.get(data.body, prop)
    return value
  } catch {
    return null
  }
}

const apply = async (file) => {
  const kc = new k8s.KubeConfig()
  kc.loadFromDefault()

  const json = yaml.load(file.content)

  try {
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api)
    await k8sApi.readNamespacedPod(json.metadata.name, ns)
  } catch {
    try {
      const client = k8s.KubernetesObjectApi.makeApiClient(kc)
      logger.info(`Applying ${file.name}`)
      await client.create(json)
    } catch (err) {
      logger.error(`Error applying ${file.name}: ${err}`)
    }
  }
}

module.exports = {
  apply,
  pod
}
