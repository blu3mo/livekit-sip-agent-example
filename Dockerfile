FROM python:3.11-slim

# 作業ディレクトリを設定
WORKDIR /app

# システムパッケージを更新し、必要なツールをインストール
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 依存関係ファイルをコピー
COPY requirements.txt .

# Python依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションファイルをコピー
COPY agent.py .
COPY env.py .
COPY conversation_recorder.py .

# 実行ユーザーを作成（セキュリティのため）
RUN useradd -m -u 1000 agent && chown -R agent:agent /app
USER agent

# アプリケーションを実行
CMD ["python", "agent.py", "dev"]