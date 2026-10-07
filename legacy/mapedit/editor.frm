VERSION 5.00
Begin VB.Form Form1 
   Caption         =   "Form1"
   ClientHeight    =   6300
   ClientLeft      =   60
   ClientTop       =   345
   ClientWidth     =   9555
   LinkTopic       =   "Form1"
   ScaleHeight     =   6300
   ScaleWidth      =   9555
   StartUpPosition =   3  'Windows Default
   Begin VB.CommandButton spara 
      Caption         =   "spara"
      Height          =   375
      Left            =   7680
      TabIndex        =   3
      Top             =   4680
      Width           =   855
   End
   Begin VB.CommandButton go 
      Caption         =   "go"
      Height          =   615
      Left            =   1440
      TabIndex        =   2
      Top             =   4920
      Width           =   735
   End
   Begin VB.CommandButton Command1 
      Caption         =   "ny linje"
      Height          =   495
      Left            =   4920
      TabIndex        =   1
      Top             =   4560
      Width           =   1215
   End
   Begin VB.Timer Timer1 
      Enabled         =   0   'False
      Interval        =   10
      Left            =   2880
      Top             =   3360
   End
   Begin VB.Line lin 
      Index           =   0
      X1              =   2000
      X2              =   2000
      Y1              =   -10000
      Y2              =   1500
   End
   Begin VB.Label Label1 
      Caption         =   "Label1"
      Height          =   375
      Left            =   2760
      TabIndex        =   0
      Top             =   0
      Width           =   500
   End
End
Attribute VB_Name = "Form1"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = False
Option Explicit
Dim i, lineantal, distance, dirr, back As Integer
Dim selected As Boolean

Private Sub Command1_Click()
lineantal = lineantal + 1
Load lin(lineantal)
lin(lineantal).X1 = lin(lineantal - 1).X2
lin(lineantal).Y1 = lin(lineantal - 1).Y2
lin(lineantal).X2 = lin(lineantal - 1).X2
lin(lineantal).Y2 = lin(lineantal - 1).Y2
lin(lineantal).X2 = lin(lineantal).X2 + 500
lin(lineantal).Y2 = lin(lineantal).Y1
distance = 500
back = 6
lin(lineantal).Visible = True
selected = True
End Sub

Private Sub Command1_KeyDown(KeyCode As Integer, Shift As Integer)
If KeyCode = vbKeyC And selected = True And back = 6 Then
lin(lineantal).X2 = lin(lineantal).X2 + 100
distance = distance + 100
ElseIf KeyCode = vbKeyC And selected = True And back = 4 Then
lin(lineantal).X2 = lin(lineantal).X2 - 100
distance = distance + 100
ElseIf KeyCode = vbKeyC And selected = True And back = 2 Then
lin(lineantal).Y2 = lin(lineantal).Y2 + 100
distance = distance + 100
ElseIf KeyCode = vbKeyC And selected = True And back = 8 Then
lin(lineantal).Y2 = lin(lineantal).Y2 - 100
distance = distance + 100
ElseIf KeyCode = vbKeyX And selected = True And distance And back = 6 Then
lin(lineantal).X2 = lin(lineantal).X2 - 100
distance = distance - 100
ElseIf KeyCode = vbKeyX And selected = True And distance And back = 4 Then
lin(lineantal).X2 = lin(lineantal).X2 + 100
distance = distance - 100
ElseIf KeyCode = vbKeyX And selected = True And distance And back = 2 Then
lin(lineantal).Y2 = lin(lineantal).Y2 - 100
distance = distance - 100
ElseIf KeyCode = vbKeyX And selected = True And distance And back = 8 Then
lin(lineantal).Y2 = lin(lineantal).Y2 + 100
distance = distance - 100
ElseIf KeyCode = vbKeyNumpad2 And selected = True Then
lin(lineantal).Y2 = lin(lineantal).Y1
lin(lineantal).X2 = lin(lineantal).X1
lin(lineantal).Y2 = lin(lineantal).Y2 + distance
back = 2
ElseIf KeyCode = vbKeyNumpad6 And selected = True Then
lin(lineantal).Y2 = lin(lineantal).Y1
lin(lineantal).X2 = lin(lineantal).X1
lin(lineantal).X2 = lin(lineantal).X2 + distance
back = 6
ElseIf KeyCode = vbKeyNumpad4 And selected = True Then
lin(lineantal).Y2 = lin(lineantal).Y1
lin(lineantal).X2 = lin(lineantal).X1
lin(lineantal).X2 = lin(lineantal).X2 - distance
back = 4
ElseIf KeyCode = vbKeyNumpad8 And selected = True Then
lin(lineantal).Y2 = lin(lineantal).Y1
lin(lineantal).X2 = lin(lineantal).X1
lin(lineantal).Y2 = lin(lineantal).Y2 - distance
back = 8
End If

End Sub

Private Sub Form_Click()
selected = False
End Sub


Private Sub Form_Load()
back = 6
End Sub

Private Sub go_Click()
Timer1.Enabled = True
End Sub

Private Sub spara_Click()

Open App.Path & "\test.txt" For Output As #1

Print #1, lineantal + 1

For i = 0 To lineantal
Print #1, lin(i).X1
Print #1, lin(i).X2
Print #1, lin(i).Y1
Print #1, lin(i).Y2
Next i

Close #1

End Sub

Private Sub Timer1_Timer()
For i = 0 To lineantal
    If ((Label1.Left >= lin(i).X1 And Label1.Left <= lin(i).X2) Or (Label1.Left <= lin(i).X1 And Label1.Left >= lin(i).X2)) And ((Label1.Top >= lin(i).Y1 And Label1.Top <= lin(i).Y2) Or (Label1.Top <= lin(i).Y1 And Label1.Top >= lin(i).Y2)) Then
        If lin(i).Y1 < lin(i).Y2 Then
        Label1.Top = Label1.Top + 20
        ElseIf lin(i).Y1 > lin(i).Y2 Then
        Label1.Top = Label1.Top - 20
        ElseIf lin(i).X1 < lin(i).X2 Then
        Label1.Left = Label1.Left + 20
        ElseIf lin(i).X1 > lin(i).X2 Then
        Label1.Left = Label1.Left - 20
        End If
    End If
Next i
End Sub
