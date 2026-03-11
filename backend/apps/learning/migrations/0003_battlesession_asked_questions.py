from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("learning", "0002_battleprogress_battlesession"),
    ]

    operations = [
        migrations.AddField(
            model_name="battlesession",
            name="asked_questions",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
