"""Database CRUD işlemleri"""

from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.app.models.database import User, Analysis, Feedback
from backend.app.schemas.analysis import AnalysisRequest


class AnalysisCRUD:
    """Analysis CRUD operations"""

    @staticmethod
    def create_analysis(
        db: Session,
        report: dict,
        user_id: Optional[int] = None,
        format_type: str = "auto",
        privacy_mode: bool = True,
    ) -> Analysis:
        """Yeni analiz kaydı oluştur"""
        
        metrics = report.get("metrics", {})
        conversation_stats = report.get("conversation_stats", {})
        
        analysis = Analysis(
            user_id=user_id,
            format_type=format_type,
            privacy_mode=privacy_mode,
            text_length=report.get("metadata", {}).get("text_length", 0),
            overall_score=report.get("overall_score", 0.0),
            sentiment_score=metrics.get("sentiment", {}).get("score", 0.0),
            empathy_score=metrics.get("empathy", {}).get("score", 0.0),
            conflict_score=metrics.get("conflict", {}).get("score", 0.0),
            we_language_score=metrics.get("we_language", {}).get("score", 0.0),
            balance_score=metrics.get("communication_balance", {}).get("score", 0.0),
            full_report=report,
            summary=report.get("summary", ""),
            message_count=conversation_stats.get("total_messages", 0),
            participant_count=conversation_stats.get("participant_count", 0),
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis

    @staticmethod
    def get_analysis_by_id(db: Session, analysis_id: int) -> Optional[Analysis]:
        """ID'ye göre analiz getir"""
        return db.query(Analysis).filter(Analysis.id == analysis_id).first()

    @staticmethod
    def get_user_analyses(
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 10
    ) -> List[Analysis]:
        """Kullanıcının tüm analizlerini getir"""
        return (
            db.query(Analysis)
            .filter(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_recent_analyses(
        db: Session,
        skip: int = 0,
        limit: int = 10
    ) -> List[Analysis]:
        """Son analizleri getir (admin için)"""
        return (
            db.query(Analysis)
            .order_by(Analysis.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def delete_analysis(db: Session, analysis_id: int) -> bool:
        """Analizi sil"""
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if analysis:
            db.delete(analysis)
            db.commit()
            return True
        return False
    @staticmethod
    def get_user_stats(db: Session, user_id: int) -> dict:
        """Kullanıcı istatistiklerini hesapla"""
        from sqlalchemy import func
        from datetime import datetime, timedelta
        
        # 1. Toplam Analiz Sayısı
        total_analyses = db.query(Analysis).filter(Analysis.user_id == user_id).count()
        
        # 2. Haftalık Ortalama Skor
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        weekly_score = db.query(func.avg(Analysis.overall_score)).filter(
            Analysis.user_id == user_id,
            Analysis.created_at >= seven_days_ago
        ).scalar() or 0.0
        
        # 3. Seri (Streak) Hesaplama (Basitleştirilmiş: Son analiz tarihinden geriye doğru)
        # Gerçek bir streak için 'DailyPulse' veya günlük unique analiz günleri kontrol edilmeli.
        # Burada basitçe son 7 günde kaç gün aktivite var onu sayalım (Weekly Consistency)
        
        # Son 30 gündeki aktivite günlerini çek
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_days = db.query(func.date(Analysis.created_at)).filter(
            Analysis.user_id == user_id,
            Analysis.created_at >= thirty_days_ago
        ).group_by(func.date(Analysis.created_at)).all()
        
        streak = 0
        current_date = datetime.utcnow().date()
        
        # Basit streak mantığı: Bugün veya dün işlem yaptıysa seriyi koru
        # active_days is list of tuples like [(date(2023,1,1)), ...]
        active_dates = {day[0] for day in active_days}
        
        if current_date in active_dates or (current_date - timedelta(days=1)) in active_dates:
            # Geriye doğru say
            check_date = current_date
            if current_date not in active_dates: # Eğer bugün yapmadıysa dünden başlat
                 check_date -= timedelta(days=1)
            
            while check_date in active_dates:
                streak += 1
                check_date -= timedelta(days=1)
        
        return {
            "total_analyses": total_analyses,
            "weekly_score": round(weekly_score, 1),
            "streak": streak
        }

class FeedbackCRUD:
    """Feedback CRUD operations"""

    @staticmethod
    def create_feedback(
        db: Session,
        analysis_id: int,
        rating: int,
        is_accurate: Optional[bool] = None,
        comment: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> Feedback:
        """Yeni feedback oluştur"""
        feedback = Feedback(
            analysis_id=analysis_id,
            user_id=user_id,
            rating=rating,
            is_accurate=is_accurate,
            comment=comment,
        )
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback

    @staticmethod
    def get_analysis_feedback(db: Session, analysis_id: int) -> List[Feedback]:
        """Analiz için feedback'leri getir"""
        return db.query(Feedback).filter(Feedback.analysis_id == analysis_id).all()


class UserCRUD:
    """User CRUD operations"""

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Email'e göre kullanıcı getir"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """ID'ye göre kullanıcı getir"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create_user(
        db: Session,
        email: str,
        hashed_password: str,
        full_name: Optional[str] = None,
        username: Optional[str] = None,
    ) -> User:
        """Yeni kullanıcı oluştur"""
        # Ensure username is set if not provided (fallback logic from original code)
        final_username = username if username else email.split("@")[0]
        
        user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            username=final_username,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user_pro_status(db: Session, user_id: int, is_pro: bool, end_date: Optional[datetime] = None) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_pro = is_pro
            user.subscription_end_date = end_date
            db.commit()
            db.refresh(user)
        return user
