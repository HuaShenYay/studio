// 已删除 PDF 导入功能，此路由不再使用。
export async function POST() {
  return new Response(JSON.stringify({ error: 'PDF 导入功能已移除' }), { status: 410 });
}


