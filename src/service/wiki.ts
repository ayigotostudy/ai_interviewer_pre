import request from '@/plugins/axiosInstance'

// Wiki类型枚举
export enum WikiType {
  KNOWLEDGE_BASE = 0, // 知识库（根节点）
  FOLDER = 1,         // 文件夹
  ARTICLE = 2         // 文章
}

// Wiki项目接口
export interface WikiItem {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: null | string
  title: string
  url: string
  type: WikiType
  parent_id: number
  wiki_type: number
  user_id: number
  root_id: number
  content?: string // 文件内容，可选属性
}

// 创建Wiki请求参数
export interface CreateWikiParams {
  title: string
  parent_id: number
  wiki_type: number
  root_id: number
  url: string
  file?: File
  type: string
}

// 知识库问答请求参数
export interface WikiQueryParams {
  query: string
  root_id: number
}

// 知识库问答响应
export interface WikiQueryResponse {
  code: number
  msg: string
  data: string
}

/**
 * 创建新的Wiki项目
 * @param params 创建参数
 * @returns 创建结果
 */
export function createWiki(params: CreateWikiParams): Promise<{ code: number; msg: string }> {
  const formData = new FormData()
  formData.append('title', params.title)
  formData.append('parent_id', params.parent_id.toString())
  formData.append('wiki_type', params.wiki_type.toString())
  formData.append('root_id', params.root_id.toString())
  formData.append('url', params.url)
  formData.append('type', params.type)
  
  if (params.file) {
    // 对于PDF文件，确保正确处理二进制数据
    if (params.file.type === 'application/pdf') {
      console.log('处理PDF文件:', params.file.name, '大小:', params.file.size)
      // 确保PDF文件以二进制形式传输
      formData.append('file', params.file, params.file.name)
    } else {
      formData.append('file', params.file)
    }
  }

  console.log('发送FormData内容:')
  for (let [key, value] of formData.entries()) {
    if (key === 'file' && value instanceof File) {
      console.log(`${key}:`, value.name, '类型:', value.type, '大小:', value.size)
    } else {
      console.log(`${key}:`, value)
    }
  }

  return request.post('/wiki', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000, // 增加超时时间，PDF文件可能较大
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    // 确保正确处理二进制数据
    responseType: 'json',
    transformResponse: [function (data) {
      return data
    }]
  }).then(response => response.data)
}

/**
 * 获取Wiki详情
 * @param id Wiki ID
 * @returns Wiki详情
 */
export function getWikiDetail(id: number): Promise<{ code: number; msg: string; data: WikiItem }> {
  return request.get(`/wiki?id=${id}`).then(response => response.data)
}

/**
 * 获取Wiki列表
 * @returns Wiki列表
 */
export function getWikiList(): Promise<{ code: number; msg: string; data: WikiItem[] }> {
  return request.get('/wiki/list').then(response => response.data)
}

/**
 * 根据parentId获取Wiki列表
 * @param parentId 父节点ID
 * @returns Wiki列表
 */
export function getWikiListByParent(parentId: number): Promise<{ code: number; msg: string; data: WikiItem[] }> {
  return request.get(`/wiki/list/parent?parent_id=${parentId}`).then(response => response.data)
}

/**
 * 获取文件内容
 * @param path 文件路径
 * @returns 文件内容
 */
export function getFileContent(path: string): Promise<string> {
  console.log('获取文件内容，路径:', path)
  console.log('编码后的路径:', encodeURIComponent(path))
  
  return request.get(`/wiki/file?path=${encodeURIComponent(path)}`, {
    headers: {
      'Accept': 'text/plain, application/json, */*'
    },
    timeout: 30000,
    // 确保正确处理文本内容
    responseType: 'text',
    transformResponse: [function (data) {
      console.log('原始响应数据:', data)
      // 如果是JSON响应，解析JSON
      if (typeof data === 'string' && data.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(data)
          console.log('解析后的JSON:', parsed)
          return parsed
        } catch (e) {
          console.log('JSON解析失败:', e)
          return data
        }
      }
      return data
    }]
  }).then(response => {
    console.log('最终响应:', response)
    // 如果响应是对象且有data字段，返回data
    if (typeof response.data === 'object' && response.data.data) {
      console.log('返回data字段:', response.data.data)
      return response.data.data
    }
    console.log('返回完整响应:', response.data)
    return response.data
  })
}

/**
 * 知识库问答
 * @param params 问答参数
 * @returns 问答结果
 */
export function queryWiki(params: WikiQueryParams): Promise<WikiQueryResponse> {
  return request.post('/wiki/query', params).then(response => response.data)
}

/**
 * 删除Wiki项目
 * @param id Wiki ID
 * @returns 删除结果
 */
export function deleteWiki(id: number): Promise<{ code: number; msg: string }> {
  return request.delete('/wiki', { data: { id } }).then(response => response.data)
}

/**
 * 更新Wiki项目
 * @param params 更新参数
 * @returns 更新结果
 */
export function updateWiki(params: Partial<WikiItem>): Promise<{ code: number; msg: string }> {
  return request.put('/wiki', params).then(response => response.data)
}
