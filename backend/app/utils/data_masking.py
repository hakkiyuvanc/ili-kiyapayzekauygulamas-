"""Data masking utilities for privacy protection (Stage 2)"""

import re
from typing import Dict, List, Tuple


class DataMasker:
    """Anonymize personal information in conversation texts"""

    # Common Turkish names (for detection)
    TURKISH_NAMES = {
        "ahmet", "mehmet", "mustafa", "ali", "hüseyin", "hasan", "ibrahim", "ismail",
        "ayşe", "fatma", "emine", "hatice", "zeynep", "elif", "merve", "selin",
        "can", "cem", "deniz", "emre", "burak", "murat", "kemal", "onur",
        "seda", "gizem", "burcu", "pınar", "ebru", "esra", "derya", "nil"
    }

    def __init__(self):
        self.name_mapping: Dict[str, str] = {}  # Original -> Masked
        self.person_counter = 0

    def _is_likely_name(self, word: str) -> bool:
        """Check if a word is likely a name"""
        # Capitalized word check
        if not word[0].isupper():
            return False

        # Check against known names
        if word.lower() in self.TURKISH_NAMES:
            return True

        # Check if it's a capitalized word in middle of sentence
        # (likely a name if not at sentence start)
        return len(word) >= 3 and word.isalpha()

    def _get_masked_name(self, original_name: str) -> str:
        """Get or create masked name for an original name"""
        if original_name in self.name_mapping:
            return self.name_mapping[original_name]

        # Create new masked name
        self.person_counter += 1
        masked = f"Kişi {chr(64 + self.person_counter)}"  # Kişi A, Kişi B, etc.
        self.name_mapping[original_name] = masked
        return masked

    def mask_text(self, text: str) -> Tuple[str, Dict[str, str]]:
        """Mask names in text
        
        Args:
            text: Original conversation text
            
        Returns:
            Tuple of (masked_text, name_mapping)
        """
        # Reset for new text
        self.name_mapping = {}
        self.person_counter = 0

        # Split into lines to preserve structure
        lines = text.split('\n')
        masked_lines = []

        for line in lines:
            # Check for WhatsApp format: "Name: message"
            whatsapp_match = re.match(r'^([A-ZÇĞİÖŞÜ][a-zçğıöşü]+):\s+(.+)$', line)
            if whatsapp_match:
                name, message = whatsapp_match.groups()
                masked_name = self._get_masked_name(name)
                masked_lines.append(f"{masked_name}: {message}")
                continue

            # Check for "Ben:" or "Sen:" format
            if line.startswith("Ben:") or line.startswith("Sen:"):
                masked_lines.append(line)
                continue

            # General name masking in text
            words = line.split()
            masked_words = []
            for word in words:
                # Remove punctuation for checking
                clean_word = word.strip('.,!?;:')
                if self._is_likely_name(clean_word):
                    masked = self._get_masked_name(clean_word)
                    # Preserve punctuation
                    if word != clean_word:
                        masked += word[len(clean_word):]
                    masked_words.append(masked)
                else:
                    masked_words.append(word)

            masked_lines.append(' '.join(masked_words))

        masked_text = '\n'.join(masked_lines)
        return masked_text, self.name_mapping

    def unmask_text(self, masked_text: str, name_mapping: Dict[str, str]) -> str:
        """Restore original names (if needed for display)
        
        Args:
            masked_text: Text with masked names
            name_mapping: Original mapping from mask_text()
            
        Returns:
            Text with original names restored
        """
        # Reverse the mapping
        reverse_mapping = {v: k for k, v in name_mapping.items()}

        unmasked_text = masked_text
        for masked, original in reverse_mapping.items():
            unmasked_text = unmasked_text.replace(masked, original)

        return unmasked_text


# Singleton instance
_masker_instance = None


def get_data_masker() -> DataMasker:
    """Get DataMasker singleton"""
    global _masker_instance
    if _masker_instance is None:
        _masker_instance = DataMasker()
    return _masker_instance


def mask_conversation(text: str) -> Tuple[str, Dict[str, str]]:
    """Convenience function to mask conversation text
    
    Args:
        text: Original conversation
        
    Returns:
        Tuple of (masked_text, name_mapping)
        
    Example:
        >>> masked, mapping = mask_conversation("Ahmet: Merhaba\\nMehmet: Selam")
        >>> print(masked)
        Kişi A: Merhaba
        Kişi B: Selam
    """
    masker = get_data_masker()
    return masker.mask_text(text)
