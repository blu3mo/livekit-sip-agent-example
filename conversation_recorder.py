import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid


class ConversationRecorder:
    """会話記録を管理するクラス"""
    
    def __init__(self, base_dir: str = "conversation_logs", batch_size: int = 50):
        self.base_dir = base_dir
        self.session_id = str(uuid.uuid4())
        self.participant_identity: Optional[str] = None
        self.start_time = datetime.now()
        self.messages: List[Dict[str, Any]] = []
        self.batch_size = batch_size
        self.total_messages = 0
        self.file_path = None
        
    def set_participant(self, identity: str):
        """参加者の識別子を設定"""
        self.participant_identity = identity
        
    def add_message(self, speaker: str, text: str, metadata: Optional[Dict[str, Any]] = None):
        """メッセージを記録に追加
        
        Args:
            speaker: 発話者 ("user" または "agent")
            text: 発話内容
            metadata: 追加のメタデータ（音声認識の信頼度など）
        """
        message = {
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "speaker": speaker,
            "text": text
        }
        
        # メタデータは必要最小限のみ
        if metadata and "is_final" in metadata:
            message["is_final"] = metadata["is_final"]
        
        self.messages.append(message)
        self.total_messages += 1
        
        # 定期的にファイルに書き込み（メモリ節約）
        if len(self.messages) >= self.batch_size:
            self._flush_to_file()
    
    def _flush_to_file(self):
        """メッセージをファイルに書き込み、メモリから削除"""
        if not self.messages:
            return
            
        # ファイルパスを初期化
        if self.file_path is None:
            date_str = self.start_time.strftime("%Y-%m-%d")
            dir_path = os.path.join(self.base_dir, date_str)
            os.makedirs(dir_path, exist_ok=True)
            self.file_path = os.path.join(dir_path, f"session_{self.session_id}.json")
        
        # 既存ファイルの読み込み
        existing_data = {"messages": []}
        if os.path.exists(self.file_path):
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
            except:
                pass
        
        # メッセージを追加
        existing_data["messages"].extend(self.messages)
        
        # メタデータを更新
        existing_data.update({
            "session": self.session_id[:8],
            "participant": self.participant_identity,
            "start": self.start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "duration": int((datetime.now() - self.start_time).total_seconds()),
            "total_messages": self.total_messages
        })
        
        # ファイルに書き込み
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, ensure_ascii=False, separators=(',', ':'))
        
        # メモリから削除
        self.messages.clear()
        
    def save(self) -> str:
        """会話記録をファイルに保存
        
        Returns:
            保存したファイルのパス
        """
        # 残りのメッセージをファイルに書き込み
        if self.messages:
            self._flush_to_file()
        
        # ファイルパスが設定されていない場合（メッセージが少ない場合）
        if self.file_path is None:
            date_str = self.start_time.strftime("%Y-%m-%d")
            dir_path = os.path.join(self.base_dir, date_str)
            os.makedirs(dir_path, exist_ok=True)
            self.file_path = os.path.join(dir_path, f"session_{self.session_id}.json")
            
            # 最初のファイル作成
            record = {
                "session": self.session_id[:8],
                "participant": self.participant_identity,
                "start": self.start_time.strftime("%Y-%m-%d %H:%M:%S"),
                "duration": int((datetime.now() - self.start_time).total_seconds()),
                "total_messages": self.total_messages,
                "messages": []
            }
            
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(record, f, ensure_ascii=False, separators=(',', ':'))
        
        return self.file_path
    
    def get_summary(self) -> Dict[str, Any]:
        """会話の要約情報を取得"""
        user_count = sum(1 for msg in self.messages if msg["speaker"] == "user")
        agent_count = sum(1 for msg in self.messages if msg["speaker"] == "agent")
        
        return {
            "session": self.session_id[:8],
            "participant": self.participant_identity,
            "duration": int((datetime.now() - self.start_time).total_seconds()),
            "total_messages": self.total_messages,
            "user_messages": user_count,
            "agent_messages": agent_count
        }