"use client";

import { useState } from "react";

export default function ScenarioForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      position: formData.get("position"),
      stackBb: Number(formData.get("stackBb")),
      players: Number(formData.get("players")),
      preflopAction: formData.get("preflopAction"),
      flopTexture: formData.get("flopTexture"),
      opponentTags: String(formData.get("opponentTags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      flopTextureWeights: {
        twoTone: Number(formData.get("twoTone") || 0),
        rainbow: Number(formData.get("rainbow") || 0),
        paired: Number(formData.get("paired") || 0)
      }
    };

    const res = await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setMessage("已创建场景，刷新页面查看。");
      event.currentTarget.reset();
    } else {
      setMessage("创建失败，请检查输入。");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-3">
      <h2 className="text-lg font-semibold">创建训练场景</h2>
      {message && <p className="text-sm text-white/70">{message}</p>}
      <div className="grid md:grid-cols-2 gap-3">
        <input name="name" placeholder="场景名称" required />
        <input name="position" placeholder="位置 (BTN/CO/SB...)" required />
        <input name="stackBb" type="number" min="10" defaultValue={100} placeholder="有效筹码 (BB)" required />
        <input name="players" type="number" min="2" defaultValue={6} placeholder="桌人数" required />
        <input name="preflopAction" placeholder="前序动作描述" required />
        <select name="flopTexture" defaultValue="rainbow">
          <option value="rainbow">翻牌纹理: 彩虹</option>
          <option value="two-tone">翻牌纹理: 两张同花</option>
          <option value="paired">翻牌纹理: 成对</option>
        </select>
        <input name="opponentTags" placeholder="对手标签 (逗号分隔)" />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <input name="twoTone" type="number" step="0.05" defaultValue={0.4} placeholder="两张同花权重" />
        <input name="rainbow" type="number" step="0.05" defaultValue={0.4} placeholder="彩虹权重" />
        <input name="paired" type="number" step="0.05" defaultValue={0.2} placeholder="成对权重" />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "创建中..." : "创建场景"}
      </button>
    </form>
  );
}
